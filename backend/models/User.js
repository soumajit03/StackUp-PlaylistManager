const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk or Auth provider user id
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);
