const express = require('express');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register for an event
router.post('/:eventId', authenticate, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'published') return res.status(400).json({ message: 'Event is not available for registration' });
    if (event.isFull) return res.status(400).json({ message: 'Event is fully booked' });
    
    const now = new Date();
    if (now > event.date) return res.status(400).json({ message: 'Event has already passed' });
    if (event.registrationDeadline && now > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check existing registration
    const existing = await Registration.findOne({ event: eventId, user: userId });
    if (existing) {
      if (existing.status === 'cancelled') {
        // Re-register
        existing.status = 'confirmed';
        await existing.save();
        await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

        const io = req.app.get('io');
        const updatedEvent = await Event.findById(eventId).lean();
        io.to(`event_${eventId}`).emit('registration_update', {
          eventId,
          registrationCount: updatedEvent.registrationCount,
          availableSpots: event.capacity - updatedEvent.registrationCount
        });
        io.emit('event_registration_count', { eventId, count: updatedEvent.registrationCount });

        return res.json({ registration: existing, message: 'Successfully re-registered!' });
      }
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const registration = await Registration.create({
      event: eventId,
      user: userId,
      attendeeInfo: {
        name: req.user.name,
        email: req.user.email,
        ...req.body.attendeeInfo
      },
      paymentStatus: event.price === 0 ? 'free' : 'pending'
    });

    // Increment count atomically
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });
    
    const updatedEvent = await Event.findById(eventId).lean();
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event_${eventId}`).emit('registration_update', {
      eventId,
      registrationCount: updatedEvent.registrationCount,
      availableSpots: event.capacity - updatedEvent.registrationCount
    });
    io.emit('event_registration_count', { eventId, count: updatedEvent.registrationCount });

    // Send notification to organizer
    const connectedUsers = req.app.get('connectedUsers');
    const organizerSocketId = connectedUsers.get(event.organizer.toString());
    if (organizerSocketId) {
      io.to(organizerSocketId).emit('new_registration', {
        eventId,
        eventTitle: event.title,
        userName: req.user.name,
        registrationCount: updatedEvent.registrationCount
      });
    }

    await registration.populate('event', 'title date location');
    res.status(201).json({ registration, message: 'Successfully registered!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel registration
router.delete('/:eventId', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      event: req.params.eventId,
      user: req.user._id,
      status: 'confirmed'
    });
    
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.status = 'cancelled';
    await registration.save();
    
    await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registrationCount: -1 } });
    
    const updatedEvent = await Event.findById(req.params.eventId).lean();
    
    const io = req.app.get('io');
    io.to(`event_${req.params.eventId}`).emit('registration_update', {
      eventId: req.params.eventId,
      registrationCount: updatedEvent.registrationCount,
      availableSpots: updatedEvent.capacity - updatedEvent.registrationCount
    });
    io.emit('event_registration_count', { eventId: req.params.eventId, count: updatedEvent.registrationCount });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's registrations
router.get('/my/registrations', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [registrations, total] = await Promise.all([
      Registration.find(query)
        .populate('event', 'title date location image category status registrationCount capacity organizer')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Registration.countDocuments(query)
    ]);

    res.json({ registrations, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user is registered for an event
router.get('/check/:eventId', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findOne({
      event: req.params.eventId,
      user: req.user._id
    });
    res.json({ isRegistered: !!registration && registration.status === 'confirmed', registration });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;