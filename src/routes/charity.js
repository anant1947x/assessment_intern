const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const User = require('../models/User');
const authCheck = require('../middleware/authCheck');

// Get all charities
router.get('/', async (req, res) => {
    const charities = await Charity.find();
    res.json(charities);
});

// User donates % of winning to specific charity
router.post('/donate', authCheck, async (req, res) => {
    const { charityId, percentage } = req.body;
    if (percentage < 10) return res.status(400).json({ msg: 'Minimum 10% required' });

    const user = await User.findById(req.user.id);
    if (user.walletBalance <= 0) return res.status(400).json({ msg: 'No pending winnings to donate from.' });
    
    const charity = await Charity.findById(charityId);
    if (!charity) return res.status(404).json({ msg: 'Charity not found' });

    const amountToDonate = (user.walletBalance * percentage) / 100;
    
    charity.totalReceived += amountToDonate;
    await charity.save();

    user.selectedCharity = charity._id;
    user.charityPercentage = percentage;
    user.totalDonated += amountToDonate;
    user.walletBalance -= amountToDonate; // They "withdraw/use" the rest eventually
    
    await user.save();

    res.json({ msg: `Donated ${amountToDonate} to ${charity.name}`, user });
});

module.exports = router;