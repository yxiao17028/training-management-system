const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Program = require('../models/Program');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Trainer = require('../models/Trainer');

router.get('/dashboard', auth, role(['admin']), async (req, res) => {
  // basic stats to match admin expected outcome
  const totalPrograms = await Program.count();
  const totalParticipants = await User.count({ role: 'participant' });
  const paymentsPending = await Registration.count({ 'payment.status': 'pending' });
  const paymentsVerified = await Registration.count({ 'payment.status': 'verified' });
  const certificatesIssued = await Registration.count({ certificateIssued: true });
  const trainersCount = await Trainer.count();
  res.json({
    totalPrograms, totalParticipants, paymentsPending, paymentsVerified, certificatesIssued, trainersCount
  });
});

// delete staff
router.delete('/staff/:id', auth, role(['admin']), async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') return res.status(404).json({ message: 'Staff not found' });
    await staff.deleteOne();
    res.json({ message: 'Staff deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
