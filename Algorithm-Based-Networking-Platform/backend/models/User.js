const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio: { type: String, default: 'Passionate about meaningful conversations and shared interests.' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  title: { type: String, default: 'Community Member' },
  avatarColor: { type: String, default: '#6366F1' },
  topics: [{ type: String }],
  clusterTheme: { type: String, default: 'General Community' },
  accountStatus: {
    type: String,
    enum: ['active', 'soft_banned', 'banned'],
    default: 'active'
  },
  softBanUntil: { type: Date, default: null },
  banReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
