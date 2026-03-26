const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');

const authCheck = require('../middleware/authCheck');

// Middleware to check admin
const adminCheck = (req, res, next) => {
    if(req.user.role !== 'admin') return res.status(403).json({msg: 'Access denied: Admins only'});
    next();
};

// Start a new draw manually
router.post('/run-draw', authCheck, adminCheck, async (req, res) => {
    try {
        // Prevent running more than once a month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const existingDraw = await Draw.findOne({ createdAt: { $gte: startOfMonth } });
        
        if(existingDraw) {
            return res.status(400).json({msg: 'A lucky draw has already been executed for this month.'});
        }

        // Find users with active subs
        const activeUsers = await User.find({ subscriptionActive: true, role: 'user' });
        
        // Calculate Pool (1 rs / 1 month = approx 1 rs per user for simplicity)
        let newRevenue = 0;
        activeUsers.forEach(u => newRevenue += (u.plan === '12month' ? 0.83 : 1)); // average monthly rev
        
        // Let's generate winning numbers
        const winningNumbers = [];
        while(winningNumbers.length < 5) {
            let num = Math.floor(Math.random() * 45) + 1;
            if(!winningNumbers.includes(num)) winningNumbers.push(num);
        }

        const prevDraw = await Draw.findOne().sort({ createdAt: -1 });
        const rollover = prevDraw && prevDraw.match5Rollover > 0 ? prevDraw.match5Rollover : 0;
        
        const totalPool = newRevenue + rollover;
        const match5Pool = totalPool * 0.40;
        const match4Pool = totalPool * 0.35;
        const match3Pool = totalPool * 0.25;

        // Determine Winners
        let match5Winners = [];
        let match4Winners = [];
        let match3Winners = [];

        activeUsers.forEach(u => {
            if(!u.selectedNumbers || u.selectedNumbers.length < 5) return;
            const matches = u.selectedNumbers.filter(n => winningNumbers.includes(n)).length;
            if(matches === 5) match5Winners.push(u);
            if(matches === 4) match4Winners.push(u);
            if(matches === 3) match3Winners.push(u);
        });

        // Distribute
        const newDraw = new Draw({
            winningNumbers,
            totalRevenue: newRevenue,
            rolloverFromPrevious: rollover,
            totalPool,
            match5Pool,
            match4Pool,
            match3Pool,
            status: 'completed'
        });

        if (match5Winners.length > 0) {
            newDraw.hasMatch5Winner = true;
            const split = match5Pool / match5Winners.length;
            for(let w of match5Winners) {
                w.walletBalance += split;
                w.totalWinnings += split;
                w.payoutStatus = 'pending';
                await w.save();
            }
        } else {
            newDraw.match5Rollover = match5Pool;
        }

        let charityDonation = 0;
        if(match4Winners.length > 0) {
            const split = match4Pool / match4Winners.length;
            for(let w of match4Winners) {
                w.walletBalance += split;
                w.totalWinnings += split;
                w.payoutStatus = 'pending';
                await w.save();
            }
        } else {
            charityDonation += match4Pool;
        }

        if(match3Winners.length > 0) {
            const split = match3Pool / match3Winners.length;
            for(let w of match3Winners) {
                w.walletBalance += split;
                w.totalWinnings += split;
                w.payoutStatus = 'pending';
                await w.save();
            }
        } else {
            charityDonation += match3Pool;
        }

        newDraw.charityDonationFromUnmatched = charityDonation;
        await newDraw.save();

        res.json({ msg: 'Draw completed!', draw: newDraw });
    } catch(err) {
        res.status(500).json({msg: err.message});
    }
});

// Create Charity
router.post('/charity', authCheck, adminCheck, async (req, res) => {
    const charity = new Charity(req.body);
    await charity.save();
    res.json(charity);
});

// View all Draws & Stats
router.get('/stats', authCheck, adminCheck, async (req, res) => {
    const draws = await Draw.find().sort({ createdAt: -1 });
    const users = await User.countDocuments();
    const pendingPayouts = await User.find({ payoutStatus: 'pending' }).select('email walletBalance proofUrl totalWinnings payoutStatus');
    res.json({ draws, totalUsers: users, pendingPayouts });
});

// Get all users
router.get('/users', authCheck, adminCheck, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch(err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

// Delete User
router.delete('/user/:id', authCheck, adminCheck, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({msg: 'User deleted'});
    } catch(err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

// Get all charities
router.get('/charities', authCheck, adminCheck, async (req, res) => {
    try {
        const charities = await Charity.find();
        res.json(charities);
    } catch(err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

// Delete charity
router.delete('/charity/:id', authCheck, adminCheck, async (req, res) => {
    try {
        await Charity.findByIdAndDelete(req.params.id);
        res.json({msg: 'Charity deleted'});
    } catch(err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

// Approve payout
router.post('/approve-payout/:userId', authCheck, adminCheck, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(404).json({msg: 'User not found'});
        user.payoutStatus = 'paid';
        user.walletBalance = 0; // Paid out
        await user.save();
        res.json({msg: 'Payout approved successfully', user});
    } catch (err) {
        res.status(500).json({msg: 'Server Error'});
    }
});

module.exports = router;