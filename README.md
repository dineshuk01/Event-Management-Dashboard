# 🎯 EventSphere — Event Management Dashboard

A full-stack event management platform built with **React**, **Node.js/Express**, **MongoDB**, and **Socket.IO** for real-time updates.

---

## 🚀 Features

### For Attendees (Users)
- 🔍 Browse and search events with category filters
- 📅 View real-time seat availability (live updates via Socket.IO)
- ✅ One-click registration with auto-generated ticket codes
- 📋 Personal dashboard with upcoming/past/cancelled events
- 🔔 Real-time notifications for event reminders and deadlines

### For Organizers
- ➕ Full event creation with agenda, location, pricing, tags
- 📊 Dashboard with live registration stats and recent activity
- ✏️ Edit events with instant real-time updates pushed to attendees
- 📣 Broadcast notifications to all registered attendees
- 📈 Registration counts update live across all connected clients
- 🗑️ Delete events (auto-cancels all registrations)

### Real-Time (Socket.IO)
- Live registration counts update instantly on all event cards
- New event notifications broadcast to all users
- Organizer receives instant alerts when someone registers
- Push notifications delivered in real-time to connected users

### Bonus: Notification System
- Automated hourly cron job checks for events starting within 24 hours
- Registration deadline reminders sent 24 hours before cutoff
- Organizers can broadcast custom messages to all attendees
- In-app notification bell with unread count badge

---

## 📁 Project Structure

```
event-dashboard/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with notifications
│   │   ├── Event.js         # Event schema with virtuals
│   │   └── Registration.js  # Registration with ticket codes
│   ├── routes/
│   │   ├── auth.js          # Login, register, profile
│   │   ├── events.js        # CRUD + stats
│   │   ├── registrations.js # Register/cancel + real-time
│   │   └── notifications.js # Broadcast + read status
│   ├── middleware/
│   │   └── auth.js          # JWT auth + Socket.IO auth
│   ├── utils/
│   │   └── notifications.js # Cron job notification logic
│   ├── server.js            # Express + Socket.IO setup
│   └── seed.js              # Demo data seeder
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx   # Global auth state
        │   └── SocketContext.jsx # Socket.IO + live updates
        ├── pages/
        │   ├── EventsPage.jsx         # Browse with search/filter
        │   ├── EventDetailPage.jsx    # Full event + registration
        │   ├── OrganizerDashboard.jsx # Event management
        │   ├── UserDashboard.jsx      # My registrations
        │   ├── CreateEventPage.jsx    # Create form
        │   ├── EditEventPage.jsx      # Edit form
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        ├── components/
        │   ├── shared/
        │   │   ├── Layout.jsx    # Nav + footer
        │   │   └── EventCard.jsx # Card with live count bar
        │   └── organizer/
        │       └── EventForm.jsx # Full event form
        └── utils/
            ├── api.js      # Axios instance
            └── helpers.js  # Formatters, color utils
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed demo data
node seed.js

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Open in browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Organizer | organizer@demo.com | demo123 |
| User | user@demo.com | demo123 |

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events` | — | List published events |
| GET | `/api/events/featured` | — | Featured events |
| GET | `/api/events/my-events` | Organizer | My events |
| GET | `/api/events/stats/overview` | Organizer | Dashboard stats |
| GET | `/api/events/:id` | — | Single event |
| POST | `/api/events` | Organizer | Create event |
| PUT | `/api/events/:id` | Organizer | Update event |
| DELETE | `/api/events/:id` | Organizer | Delete event |

### Registrations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/registrations/:eventId` | User | Register for event |
| DELETE | `/api/registrations/:eventId` | User | Cancel registration |
| GET | `/api/registrations/my/registrations` | User | My registrations |
| GET | `/api/registrations/check/:eventId` | User | Check registration status |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | User | Get notifications |
| PUT | `/api/notifications/read-all` | User | Mark all as read |
| POST | `/api/notifications/broadcast/:eventId` | Organizer | Broadcast to attendees |

---

## 🔌 Socket.IO Events

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `join_event_room` | `eventId` | Subscribe to event updates |
| `leave_event_room` | `eventId` | Unsubscribe |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `event_registration_count` | `{eventId, count}` | Live count update |
| `registration_update` | `{eventId, count, spots}` | Event room update |
| `new_notification` | notification object | Push notification |
| `new_registration` | registration summary | Alert to organizer |
| `new_event` | event object | New published event |
| `event_updated` | event object | Event was modified |
| `event_deleted` | `{eventId}` | Event was deleted |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State/Data | TanStack Query v5 |
| Routing | React Router v6 |
| Real-time | Socket.IO Client |
| HTTP | Axios |
| Backend | Node.js, Express |
| Real-time | Socket.IO |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Scheduling | node-cron |
| Notifications | Toast (react-hot-toast) |
