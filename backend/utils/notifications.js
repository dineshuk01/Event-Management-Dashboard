const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

const sendUpcomingEventNotifications = async (io, connectedUsers) => {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

  // Events happening in next 24 hours
  const upcomingEvents = await Event.find({
    status: 'published',
    date: { $gte: now, $lte: in24Hours }
  });

  for (const event of upcomingEvents) {
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed'
    }).distinct('user');

    const hoursUntilEvent = Math.round((event.date - now) / (1000 * 60 * 60));
    const message = hoursUntilEvent <= 1
      ? `⏰ "${event.title}" starts in less than an hour!`
      : `📅 Reminder: "${event.title}" is in ${hoursUntilEvent} hours`;

    const notification = {
      message,
      type: hoursUntilEvent <= 1 ? 'warning' : 'info',
      eventId: event._id,
      read: false,
      createdAt: new Date()
    };

    await User.updateMany(
      { _id: { $in: registrations } },
      { $push: { notifications: { $each: [notification], $position: 0 } } }
    );

    registrations.forEach(userId => {
      const socketId = connectedUsers.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit('new_notification', {
          ...notification,
          eventTitle: event.title
        });
      }
    });
  }

  // Registration deadline reminders (deadlines in next 24 hours)
  const deadlineEvents = await Event.find({
    status: 'published',
    registrationDeadline: { $gte: now, $lte: in24Hours }
  });

  for (const event of deadlineEvents) {
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed'
    }).distinct('user');

    const hoursUntilDeadline = Math.round((event.registrationDeadline - now) / (1000 * 60 * 60));
    const message = `⚠️ Registration deadline for "${event.title}" closes in ${hoursUntilDeadline} hours!`;

    const notification = {
      message,
      type: 'deadline',
      eventId: event._id,
      read: false,
      createdAt: new Date()
    };

    await User.updateMany(
      { _id: { $in: registrations } },
      { $push: { notifications: { $each: [notification], $position: 0 } } }
    );

    registrations.forEach(userId => {
      const socketId = connectedUsers.get(userId.toString());
      if (socketId) {
        io.to(socketId).emit('new_notification', {
          ...notification,
          eventTitle: event.title
        });
      }
    });
  }

  console.log(`✅ Notifications sent for ${upcomingEvents.length} upcoming events`);
};

module.exports = { sendUpcomingEventNotifications };