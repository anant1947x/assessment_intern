const mongoose = require('mongoose');

const DrawSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  winningNumbers: [{ type: Number, min: 1, max: 45 }],
  
  // Financials
  totalRevenue: { type: Number, required: true }, // Revenue from subscriptions
  rolloverFromPrevious: { type: Number, default: 0 }, // From previous 5-match failures
  totalPool: { type: Number, required: true },
  
  // Prize Distributions
  match5Pool: { type: Number, default: 0 }, // 40%
  match4Pool: { type: Number, default: 0 }, // 35%
  match3Pool: { type: Number, default: 0 }, // 25%

  // Winners Status
  hasMatch5Winner: { type: Boolean, default: false },
  match5Rollover: { type: Number, default: 0 }, // Goes to next month if false
  
  charityDonationFromUnmatched: { type: Number, default: 0 }, // Unmatched 4 & 3 goes to charity

  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Draw', DrawSchema);