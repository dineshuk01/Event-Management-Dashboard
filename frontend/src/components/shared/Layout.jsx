import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { Bell, Calendar, ChevronDown, LogOut, LayoutDashboard, Plus, User, Wifi, WifiOff, Menu, X } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

export default function Layout() {
  const { user, logout } = useAuth()
  const { connected, notifications } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const notifRef = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const navLinks = [
    { to: '/', label: 'Browse Events' },
    ...(user ? [{ to: user.role === 'organizer' ? '/organizer' : '/dashboard', label: user.role === 'organizer' ? 'Dashboard' : 'My Events' }] : []),
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-violet-500 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">EventSphere</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.to ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2" ref={notifRef}>
              {/* Connection indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${connected ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-zinc-700 text-zinc-500 bg-zinc-800/50'}`}>
                {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span className="hidden lg:inline">{connected ? 'Live' : 'Offline'}</span>
              </div>

              {user ? (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false) }}
                      className="relative p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <Bell size={18} />
                      {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </button>

                    {showNotifs && (
                      <div className="absolute right-0 mt-2 w-80 card shadow-2xl shadow-black/40 z-50 overflow-hidden animate-slide-in">
                        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                          <span className="font-semibold text-sm">Notifications</span>
                          {unread > 0 && <span className="badge bg-sky-500/10 text-sky-400">{unread} new</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications yet</div>
                          ) : (
                            notifications.slice(0, 15).map((notif, i) => (
                              <div key={i} className={`px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${!notif.read ? 'bg-sky-500/5' : ''}`}>
                                <p className="text-sm text-zinc-200">{notif.message}</p>
                                <p className="text-xs text-zinc-500 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Create event button for organizers */}
                  {user.role === 'organizer' && (
                    <Link to="/organizer/events/create" className="hidden sm:flex items-center gap-1.5 btn-primary text-sm py-2 px-3">
                      <Plus size={15} />
                      <span className="hidden lg:inline">New Event</span>
                    </Link>
                  )}

                  {/* User menu */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false) }}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-sky-400 to-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="hidden sm:block text-sm font-medium text-zinc-200 max-w-[80px] truncate">{user.name}</span>
                      <ChevronDown size={14} className="text-zinc-500" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 card shadow-2xl shadow-black/40 z-50 overflow-hidden animate-slide-in">
                        <div className="px-3 py-2.5 border-b border-zinc-800">
                          <p className="text-sm font-medium text-zinc-200 truncate">{user.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                          <span className="badge bg-violet-500/10 text-violet-400 mt-1">{user.role}</span>
                        </div>
                        <div className="p-1">
                          <Link to={user.role === 'organizer' ? '/organizer' : '/dashboard'} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors" onClick={() => setShowUserMenu(false)}>
                            <LayoutDashboard size={15} /> Dashboard
                          </Link>
                          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-zinc-400 hover:text-red-400 transition-colors">
                            <LogOut size={15} /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm py-2">Sign in</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">Get started</Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-xl hover:bg-zinc-800 text-zinc-400" onClick={() => setMobileMenu(!mobileMenu)}>
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenu && (
          <div className="md:hidden border-t border-zinc-800 px-4 py-3 space-y-1 animate-slide-in">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="block px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800" onClick={() => setMobileMenu(false)}>
                {link.label}
              </Link>
            ))}
            {user?.role === 'organizer' && (
              <Link to="/organizer/events/create" className="block px-3 py-2.5 rounded-lg text-sm text-sky-400 hover:bg-zinc-800" onClick={() => setMobileMenu(false)}>
                + Create Event
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-violet-500 rounded-md flex items-center justify-center">
              <Calendar size={12} className="text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">EventSphere</span>
          </div>
          <p className="text-xs text-zinc-600">© 2025 EventSphere. Built with React, Node.js & MongoDB.</p>
        </div>
      </footer>
    </div>
  )
}