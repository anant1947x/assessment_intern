const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(require('cors')());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/charity', require('./routes/charity'));

// Create seed admin & charities script
const setupAdmin = async () => {
  const User = require('./models/User');
  const Charity = require('./models/Charity');
  const bcrypt = require('bcryptjs');
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@platform.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';

  let admin = await User.findOne({ role: 'admin' });
  if(!admin) {
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(adminPass, salt);
    await new User({ email: adminEmail, password: pass, role: 'admin', subscriptionActive: true }).save();
    console.log(`Admin account generated: ${adminEmail} / [HIDDEN]`);
  }

  // Dummy Charities
  const charityCount = await Charity.countDocuments();
  if(charityCount === 0) {
    const dummies = [
      { name: 'Global Water Fund', description: 'Providing clean drinking water to communities in need.' },
      { name: 'Kids Education Initiative', description: 'Funding primary education tools and schools globally.' },
      { name: 'Wildlife Rescue org', description: 'Conserving endangered species and restoring natural habitats.' }
    ];
    await Charity.insertMany(dummies);
    console.log("Dummy charities generated!");
  }
}
setupAdmin();

module.exports = app;
