const mongoose = require('mongoose');

const TrainerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  expertise: [String],
  certs: [{ name: String, expiry: Date }],
  photo: String,
  availability: [{ date: Date, slot: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trainer', TrainerSchema);
