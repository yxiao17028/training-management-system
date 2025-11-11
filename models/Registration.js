const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  registeredAt: { type: Date, default: Date.now },
  payment: {
    status: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
    receiptUrl: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    amount: Number
  },
  attendance: { type: Boolean, default: false },
  certificateIssued: { type: Boolean, default: false }
});

module.exports = mongoose.model('Registration', RegistrationSchema);
