//auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// ✅ Gmail格式验证函数
function validateGmail(email) {
  const gmailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/;
  return gmailRegex.test(email);
}

// ✅ 登录接口
router.post('/login', async (req, res) => {
  try {
    const { name, gmail, password } = req.body;
    if (!name || !gmail || !password) {
      return res.status(400).json({ message: 'Please fill all fields.' });
    }

    const user = await User.findOne({ name, gmail });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.json({
      message: 'Login successful',
      redirect: '/index.html',
      user: {
        id: user._id,
        name: user.name,
        gmail: user.gmail,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ✅ 注册接口
router.post('/register', async (req, res) => {
  try {
    const { name, gmail, password, verifyCode } = req.body;

    // Basic validation
    if (!name || !gmail || !password || !verifyCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Determine role based on code
    let role;
    switch (verifyCode.toUpperCase()) {
      case '0':
        role = 'participant';
        break;
      case 'CCCD1234':
        role = 'staff';
        break;
      case 'ADMIN1234':
        role = 'admin';
        break;
      default:
        return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check existing name or gmail
    const existingName = await User.findOne({ name });
    if (existingName) return res.status(400).json({ message: 'Name already exist, please change' });

    const existingGmail = await User.findOne({ gmail });
    if (existingGmail) return res.status(400).json({ message: 'Gmail already exist, please change' });

    // Gmail format
    const gmailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/;
    if (!gmailRegex.test(gmail)) return res.status(400).json({ message: 'Invalid gmail format' });

    // Encrypt password
    const bcrypt = require('bcryptjs');

    const newUser = new User({ name, gmail, password, role });
    await newUser.save();

    res.status(201).json({ message: `Registered successfully as ${role}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

