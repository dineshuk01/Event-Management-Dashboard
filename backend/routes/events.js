const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all published events (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, city, page = 1, limit = 12, sort = '-date', status } = req.query;
    const query = {};

    // Public sees only published events unless admin/organizer requests otherwise
    if (status && ['published', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category && category !== 'all') query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get organizer's events
router.get('/my-events', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { organizer: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)).lean(),
      Event.countDocuments(query)
    ]);

    res.json({ events, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured events
router.get('/featured', async (req, res) => {
  try {
    const events = await Event.find({ isFeatured: true, status: 'published' })
      .populate('organizer', 'name avatar')
      .sort('-date')
      .limit(6)
      .lean();
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar bio');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    await event.populate('organizer', 'name avatar');
    
    // Emit to all connected clients
    const io = req.app.get('io');
    if (event.status === 'published') {
      io.emit('new_event', event);
    }
    
    res.status(201).json({ event });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findOne({ 
      _id: req.params.id, 
      organizer: req.user.role === 'admin' ? undefined : req.user._id 
    });
    
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    const wasPublished = event.status === 'published';
    Object.assign(event, req.body);
    await event.save();
    await event.populate('organizer', 'name avatar');

    const io = req.app.get('io');
    io.to(`event_${event._id}`).emit('event_updated', event);
    
    // Notify if newly published
    if (!wasPublished && event.status === 'published') {
      io.emit('new_event', event);
    }

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user.role === 'admin' ? undefined : req.user._id
    });
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });
    
    await Registration.deleteMany({ event: req.params.id });
    
    const io = req.app.get('io');
    io.emit('event_deleted', { eventId: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event registrations (organizer only)
router.get('/:id/registrations', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      organizer: req.user.role === 'admin' ? undefined : req.user._id
    });
    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email avatar')
      .sort('-createdAt');
    
    res.json({ registrations, event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats for organizer dashboard
router.get('/stats/overview', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const organizerId = req.user._id;
    const [totalEvents, publishedEvents, totalRegistrations, upcomingEvents] = await Promise.all([
      Event.countDocuments({ organizer: organizerId }),
      Event.countDocuments({ organizer: organizerId, status: 'published' }),
      Registration.countDocuments({ 
        event: { $in: await Event.find({ organizer: organizerId }).distinct('_id') }
      }),
      Event.countDocuments({ 
        organizer: organizerId, 
        status: 'published', 
        date: { $gte: new Date() } 
      })
    ]);

    const recentRegistrations = await Registration.find({
      event: { $in: await Event.find({ organizer: organizerId }).distinct('_id') }
    })
      .populate('user', 'name email avatar')
      .populate('event', 'title date')
      .sort('-createdAt')
      .limit(10);

    res.json({ totalEvents, publishedEvents, totalRegistrations, upcomingEvents, recentRegistrations });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;