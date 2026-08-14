const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['TOURIST', 'GUIDE', 'ADMIN'], default: 'TOURIST' },
  country: { type: String, default: 'Bangladesh' },
  phone: { type: String, default: '' },
  nidOrPassport: { type: String, default: '' },
  university: { type: String, default: '' },
  city: { type: String, default: '' },
  primaryLanguage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
