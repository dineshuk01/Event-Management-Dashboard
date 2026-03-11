const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Only allow 'user' or 'organizer' roles on registration
    const allowedRole = ['user', 'organizer'].includes(role) ? role : 'user';
    
    const user = await User.create({ name, email, password, role: allowedRole });
    const token = generateToken(user._id);
    
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('notifications.eventId', 'title date');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, notificationPreferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, notificationPreferences },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notifications as read
router.put('/notifications/read', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true }
    });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;