const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Program = require('../models/Program');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/posters'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// get all programs
router.get('/', async (req, res) => {
  const programs = await Program.find().populate('trainers');
  res.json(programs);
});

// create program (staff/admin)
router.post('/', auth, role(['staff','admin']), upload.single('poster'), async (req, res) => {
  try {
    const { title, description, date, endDate, venue, fee } = req.body;
    const poster = req.file ? `/uploads/posters/${req.file.filename}` : null;
    const p = new Program({ title, description, date, endDate, venue, fee, poster });
    await p.save();
    req.app.get('io').emit('program:created', p); // real-time
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// edit
router.put('/:id', auth, role(['staff','admin']), upload.single('poster'), async (req, res) => {
  try {
    const p = await Program.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    Object.assign(p, req.body);
    if (req.file) p.poster = `/uploads/posters/${req.file.filename}`;
    await p.save();
    req.app.get('io').emit('program:updated', p);
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// delete
router.delete('/:id', auth, role(['staff','admin']), async (req, res) => {
  try {
    await Program.findByIdAndDelete(req.params.id);
    req.app.get('io').emit('program:deleted', req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// assign trainer
router.post('/:id/assign-trainer', auth, role(['staff','admin']), async (req, res) => {
  try {
    const { trainerId } = req.body;
    const p = await Program.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    if (!p.trainers.includes(trainerId)) p.trainers.push(trainerId);
    await p.save();
    req.app.get('io').emit('program:trainerChanged', { programId: p._id, trainerId });
    res.json(p);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
