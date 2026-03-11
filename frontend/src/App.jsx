import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Layout from './components/shared/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import OrganizerDashboard from './pages/OrganizerDashboard'
import UserDashboard from './pages/UserDashboard'
import CreateEventPage from './pages/CreateEventPage'
import EditEventPage from './pages/EditEventPage'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="dashboard" element={
          <ProtectedRoute><UserDashboard /></ProtectedRoute>
        } />
        <Route path="organizer" element={
          <ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>
        } />
        <Route path="organizer/events/create" element={
          <ProtectedRoute role="organizer"><CreateEventPage /></ProtectedRoute>
        } />
        <Route path="organizer/events/:id/edit" element={
          <ProtectedRoute role="organizer"><EditEventPage /></ProtectedRoute>
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
    </AuthProvider>
  )
}