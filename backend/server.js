const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const notificationRoutes = require('./routes/notifications');
const { authenticateSocket } = require('./middleware/auth');
const { sendUpcomingEventNotifications } = require('./utils/notifications');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO
const connectedUsers = new Map();

io.use(authenticateSocket);

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  if (userId) {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected (socket: ${socket.id})`);
  }

  socket.on('join_event_room', (eventId) => {
    socket.join(`event_${eventId}`);
  });

  socket.on('leave_event_room', (eventId) => {
    socket.leave(`event_${eventId}`);
  });

  socket.on('disconnect', () => {
    if (userId) {
      connectedUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  });
});

// Attach connectedUsers to app for use in notification sending
app.set('connectedUsers', connectedUsers);

// Cron: Check for upcoming events every hour and notify registered users
cron.schedule('0 * * * *', async () => {
  console.log('Running notification cron job...');
  try {
    await sendUpcomingEventNotifications(io, connectedUsers);
  } catch (err) {
    console.error('Cron notification error:', err);
  }
});

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-dashboard';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };