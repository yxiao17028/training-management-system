const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  endDate: Date,
  venue: String,
  fee: Number,
  poster: String,
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }],
  status: { type: String, enum: ['pending','running','completed','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Program', ProgramSchema);
