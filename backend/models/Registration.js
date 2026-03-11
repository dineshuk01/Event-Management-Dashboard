const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted'],
    default: 'confirmed'
  },
  ticketCode: {
    type: String,
    unique: true
  },
  attendeeInfo: {
    name: String,
    email: String,
    phone: String,
    dietaryRequirements: String,
    specialRequests: String
  },
  paymentStatus: {
    type: String,
    enum: ['free', 'pending', 'paid', 'refunded'],
    default: 'free'
  },
  checkInStatus: {
    type: Boolean,
    default: false
  },
  checkInTime: Date
}, {
  timestamps: true
});

// Unique constraint: one registration per user per event
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

// Generate ticket code before saving
registrationSchema.pre('save', function(next) {
  if (!this.ticketCode) {
    this.ticketCode = 'TKT-' + Date.now().toString(36).toUpperCase() + 
                      Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);