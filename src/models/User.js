const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Subscription info
  subscriptionActive: { type: Boolean, default: false },
  subscriptionEnd: { type: Date },
  plan: { type: String, enum: ['1month', '12month', 'none'], default: 'none' },

  // Lucky Draw
  selectedNumbers: [{ type: Number, min: 1, max: 45 }], // 5 numbers
  
  // Winnings & Charity
  totalWinnings: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 }, // Unpaid winnings
  selectedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
  charityPercentage: { type: Number, min: 10, max: 100, default: 10 }, // Min 10% on winning
  totalDonated: { type: Number, default: 0 },

  // Verification & Payout State
  proofUrl: { type: String, default: '' },
  payoutStatus: { type: String, enum: ['none', 'pending', 'approved', 'paid'], default: 'none' },

  // Golf tracking
  golfScores: [{
    courseName: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);