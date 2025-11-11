const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Trainer = require('../models/Trainer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/trainers'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// add trainer
router.post('/', auth, role(['staff','admin']), upload.single('photo'), async (req, res) => {
  try {
    const t = new Trainer(req.body);
    if (req.file) t.photo = `/uploads/trainers/${req.file.filename}`;
    await t.save();
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// edit trainer
router.put('/:id', auth, role(['staff','admin']), upload.single('photo'), async (req, res) => {
  try {
    const t = await Trainer.findById(req.params.id);
    Object.assign(t, req.body);
    if (req.file) t.photo = `/uploads/trainers/${req.file.filename}`;
    await t.save();
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// list trainers
router.get('/', auth, async (req, res) => {
  const trainers = await Trainer.find();
  res.json(trainers);
});

module.exports = router;
