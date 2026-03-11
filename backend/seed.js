const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-dashboard';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const [organizer, user1, user2] = await User.create([
    {
      name: 'Alex Chen',
      email: 'organizer@demo.com',
      password: 'demo123',
      role: 'organizer',
      bio: 'Passionate event organizer with 10 years of experience'
    },
    {
      name: 'Sarah Park',
      email: 'user@demo.com',
      password: 'demo123',
      role: 'user',
    },
    {
      name: 'Marcus Johnson',
      email: 'marcus@demo.com',
      password: 'demo123',
      role: 'user',
    }
  ]);
  console.log('Created users');

  // Create events
  const now = new Date();
  const events = await Event.create([
    {
      title: 'React & AI Summit 2025',
      description: 'Join us for the premier React and AI conference of the year. Featuring talks from industry leaders, hands-on workshops, and networking opportunities. Explore the intersection of modern web development and artificial intelligence.',
      category: 'conference',
      organizer: organizer._id,
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      location: { type: 'physical', city: 'San Francisco', country: 'USA', address: 'Moscone Center, 747 Howard St' },
      capacity: 500,
      registrationCount: 342,
      price: 299,
      currency: 'USD',
      status: 'published',
      isFeatured: true,
      tags: ['react', 'ai', 'javascript', 'web-development'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      agenda: [
        { time: '9:00 AM', title: 'Registration & Breakfast', description: 'Check in and network' },
        { time: '10:00 AM', title: 'Keynote: React 19 & Beyond', speaker: 'Dan Abramov', description: 'The future of React' },
        { time: '11:30 AM', title: 'AI-Powered Development', speaker: 'Sarah Chen', description: 'Integrating LLMs into your workflow' },
        { time: '2:00 PM', title: 'Workshop: Building with Claude', speaker: 'Alex Wu', description: 'Hands-on AI integration' },
      ]
    },
    {
      title: 'Node.js Backend Workshop',
      description: 'A full-day intensive workshop covering advanced Node.js patterns, microservices, and real-time applications with Socket.IO. Perfect for intermediate to advanced developers.',
      category: 'workshop',
      organizer: organizer._id,
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      location: { type: 'hybrid', city: 'New York', country: 'USA', address: '350 5th Ave', onlineLink: 'https://zoom.us/j/demo' },
      capacity: 50,
      registrationCount: 38,
      price: 149,
      status: 'published',
      isFeatured: false,
      tags: ['nodejs', 'backend', 'websockets', 'microservices'],
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    },
    {
      title: 'Product Design Meetup',
      description: 'Monthly gathering of product designers, UX researchers, and design leaders. Share your work, get feedback, and connect with the local design community.',
      category: 'meetup',
      organizer: organizer._id,
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      location: { type: 'physical', city: 'Austin', country: 'USA', address: '200 Congress Ave' },
      capacity: 80,
      registrationCount: 65,
      price: 0,
      status: 'published',
      isFeatured: true,
      tags: ['design', 'ux', 'product', 'community'],
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    },
    {
      title: 'Startup Networking Night',
      description: 'Connect with founders, investors, and startup enthusiasts in this casual evening networking event. Drinks, great conversations, and potential collaborations await.',
      category: 'networking',
      organizer: organizer._id,
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      location: { type: 'physical', city: 'Seattle', country: 'USA', address: '1301 5th Ave' },
      capacity: 150,
      registrationCount: 89,
      price: 25,
      status: 'published',
      isFeatured: false,
      tags: ['startup', 'networking', 'founders', 'investors'],
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80',
    },
    {
      title: 'Web3 & Blockchain Webinar',
      description: 'Online webinar exploring the latest in Web3, DeFi, and blockchain technology. Hear from experts building the decentralized web.',
      category: 'webinar',
      organizer: organizer._id,
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      location: { type: 'online', onlineLink: 'https://zoom.us/j/demo2' },
      capacity: 1000,
      registrationCount: 456,
      price: 0,
      status: 'published',
      isFeatured: false,
      tags: ['web3', 'blockchain', 'defi', 'crypto'],
    },
    {
      title: 'Cloud Architecture Deep Dive',
      description: 'A draft event for future planning.',
      category: 'workshop',
      organizer: organizer._id,
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      location: { type: 'physical', city: 'Chicago', country: 'USA' },
      capacity: 60,
      registrationCount: 0,
      price: 199,
      status: 'draft',
    }
  ]);
  console.log('Created events');

  // Add registrations
  await Registration.create([
    { event: events[0]._id, user: user1._id, status: 'confirmed', attendeeInfo: { name: user1.name, email: user1.email } },
    { event: events[2]._id, user: user1._id, status: 'confirmed', attendeeInfo: { name: user1.name, email: user1.email } },
    { event: events[1]._id, user: user2._id, status: 'confirmed', attendeeInfo: { name: user2.name, email: user2.email } },
  ]);
  console.log('Created registrations');

  console.log('\n✅ Seed complete!');
  console.log('Demo accounts:');
  console.log('  Organizer: organizer@demo.com / demo123');
  console.log('  User: user@demo.com / demo123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });