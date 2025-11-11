const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Registration = require('../models/Registration');
const Program = require('../models/Program');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/receipts'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// participant register for program
router.post('/register', auth, role(['participant']), async (req, res) => {
  try {
    const { programId } = req.body;
    const exist = await Registration.findOne({ participant: req.user._id, program: programId });
    if (exist) return res.status(400).json({ message: 'Already registered' });
    const reg = new Registration({ participant: req.user._id, program: programId });
    await reg.save();
    req.app.get('io').emit('registration:new', { programId });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// upload receipt
router.post('/:id/upload-receipt', auth, role(['participant']), upload.single('receipt'), async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Not found' });
    reg.payment.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    reg.payment.status = 'pending';
    reg.payment.amount = req.body.amount || reg.payment.amount;
    await reg.save();
    req.app.get('io').emit('payment:uploaded', { registrationId: reg._id, programId: reg.program });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// staff verify payment
router.post('/:id/verify', auth, role(['staff','admin']), async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const reg = await Registration.findById(req.params.id).populate('participant program');
    if (!reg) return res.status(404).json({ message: 'Not found' });
    reg.payment.status = status;
    reg.payment.verifiedBy = req.user._id;
    reg.payment.verifiedAt = new Date();
    await reg.save();
    req.app.get('io').emit('payment:verified', { registrationId: reg._id, status });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// staff mark attendance
router.post('/:id/attendance', auth, role(['staff','admin']), async (req, res) => {
  try {
    const { attended } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Not found' });
    reg.attendance = !!attended;
    await reg.save();
    req.app.get('io').emit('attendance:changed', { registrationId: reg._id, attended: reg.attendance });
    res.json(reg);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// get participants of program
router.get('/program/:programId', auth, role(['staff','admin']), async (req, res) => {
  try {
    const regs = await Registration.find({ program: req.params.programId }).populate('participant');
    res.json(regs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
