const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('notifications')
      .populate('notifications.eventId', 'title date');
    
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 'notifications.$[].read': true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark single notification as read
router.put('/:notifId/read', authenticate, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send notification to event registrants (organizer only)
router.post('/broadcast/:eventId', authenticate, async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.eventId, 
      organizer: req.user._id 
    });
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    const { message, type = 'info' } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    const registrations = await Registration.find({ 
      event: req.params.eventId, 
      status: 'confirmed' 
    }).distinct('user');

    const notification = {
      message,
      type,
      eventId: req.params.eventId,
      read: false,
      createdAt: new Date()
    };

    await User.updateMany(
      { _id: { $in: registrations } },
      { $push: { notifications: { $each: [notification], $position: 0 } } }
    );

    // Real-time notifications
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    
    registrations.forEach(userId => {
      const socketId = connectedUsers.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit('new_notification', {
          ...notification,
          eventTitle: event.title
        });
      }
    });

    res.json({ message: `Notification sent to ${registrations.length} attendees` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;