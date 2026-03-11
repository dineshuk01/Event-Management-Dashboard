const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['in-person', 'online', 'workshop'],
    default: 'in-person'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  registrationDeadline: {
    type: Date
  },
  location: {
    type: { type: String, enum: ['physical', 'online', 'hybrid'], default: 'physical' },
    address: String,
    city: String,
    country: String,
    onlineLink: String
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  registrationCount: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  image: {
    type: String,
    default: ''
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: availability
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.registrationCount;
});

eventSchema.virtual('isFull').get(function() {
  return this.registrationCount >= this.capacity;
});

eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  if (this.registrationDeadline && now > this.registrationDeadline) return false;
  if (now > this.date) return false;
  return this.status === 'published' && !this.isFull;
});

// Indexes
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);