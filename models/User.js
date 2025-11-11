const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/, 'Invalid Gmail format'],
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['participant', 'staff', 'admin'],
    default: 'participant',
  }
});

// 在存储前自动哈希密码
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 验证密码
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

