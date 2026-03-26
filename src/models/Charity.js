const mongoose = require('mongoose');

const CharitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  totalReceived: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Charity', CharitySchema);