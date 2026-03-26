const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register & Mock Payment
router.post('/signup', async (req, res) => {
  try {
    const { email, password, plan, mockPaymentStatus } = req.body;
    
    if (mockPaymentStatus !== 'SUCCESS') {
      return res.status(400).json({ msg: 'Payment failed or not provided. Signup denied.' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const months = plan === '1month' ? 1 : 12;
    // Set subscription end date
    const end = new Date();
    end.setMonth(end.getMonth() + months);

    user = new User({
      email,
      password: hashedPassword,
      subscriptionActive: true,
      subscriptionEnd: end,
      plan,
      walletBalance: 0
    });

    await user.save();
    res.json({ msg: 'User registered with successful mock payment!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error during signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Subscription expiration check
    if (user.role !== 'admin' && new Date(user.subscriptionEnd) < new Date()) {
      user.subscriptionActive = false;
      await user.save();
      return res.status(403).json({ msg: 'Subscription expired. Please renew.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user: { email: user.email, role: user.role, active: user.subscriptionActive } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error during login' });
  }
});

module.exports = router;
