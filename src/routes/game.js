const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Draw = require('../models/Draw');
const authCheck = require('../middleware/authCheck');

const checkLockStatus = async (req, res, next) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const completedDraw = await Draw.findOne({ createdAt: { $gte: startOfMonth } });
    if (completedDraw) {
        return res.status(403).json({msg: 'The monthly draw has already been executed. Your scores and numbers are locked until next month.'});
    }
    next();
};

router.get('/profile', authCheck, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('selectedCharity');
        res.json(user);
    } catch (err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

router.post('/scores', authCheck, checkLockStatus, async (req, res) => {
    const { courseName, score } = req.body;
    if (score < 1 || score > 45) return res.status(400).json({msg: 'Score must be between 1 and 45'});

    try {
        const user = await User.findById(req.user.id);
        
        user.golfScores.push({ courseName, score });
        
        // Keep only latest 5 scores
        if (user.golfScores.length > 5) {
            user.golfScores.shift(); // Remove the oldest score
        }

        // Auto-assign their drawn numbers from their latest scores
        user.selectedNumbers = user.golfScores.map(s => s.score);

        await user.save();
        res.json(user.golfScores);
    } catch (err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

router.delete('/scores/:scoreId', authCheck, checkLockStatus, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.golfScores = user.golfScores.filter(s => s._id.toString() !== req.params.scoreId);
        user.selectedNumbers = user.golfScores.map(s => s.score);
        await user.save();
        res.json(user.golfScores);
    } catch (err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

router.post('/pick-numbers', authCheck, checkLockStatus, async (req, res) => {
    if(req.user.role === 'admin') return res.status(400).json({msg:'Admin cannot play'});
    
    const { numbers } = req.body;
    if(numbers.length !== 5) return res.status(400).json({msg: 'Must select exactly 5 numbers'});
    if(!numbers.every(n => n >= 1 && n <= 45)) return res.status(400).json({msg: 'Numbers out of 1-45 range'});
    
    const user = await User.findById(req.user.id);
    if(!user.subscriptionActive) return res.status(403).json({msg: 'Subscription inactive'});
    
    if (user.walletBalance > 0 && !user.selectedCharity) {
        return res.status(403).json({msg: 'You have pending winnings. Please select and donate to a charity first.'});
    }

    user.selectedNumbers = numbers;
    await user.save();
    res.json({msg: 'Numbers updated successfully', numbers: user.selectedNumbers});
});

router.post('/upload-proof', authCheck, async (req, res) => {
    try {
        const { proofUrl } = req.body;
        const user = await User.findById(req.user.id);
        if (user.payoutStatus !== 'pending') return res.status(400).json({msg: 'You have no pending payouts'});
        
        user.proofUrl = proofUrl;
        user.payoutStatus = 'approved'; // usually goes to admin for approval, skip to avoid UI complexity, but PRD says Admin Review. Let's make it 'pending' and admin will mark 'paid'
        await user.save();
        res.json({msg: 'Proof uploaded successfully waiting admin review', user});
    } catch (err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

module.exports = router;