import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Ticket, CheckCircle, X, Clock, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { formatDate, getEventDateLabel, getCategoryColor, CATEGORY_EMOJIS } from '../utils/helpers'

export default function UserDashboard() {
  const { user } = useAuth()
  const { notifications } = useSocket()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('upcoming')

  const { data, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.get('/registrations/my/registrations').then(r => r.data),
  })

  const cancelMutation = useMutation({
    mutationFn: (eventId) => api.delete(`/registrations/${eventId}`),
    onSuccess: () => {
      toast.success('Registration cancelled')
      queryClient.invalidateQueries(['my-registrations'])
    },
    onError: () => toast.error('Failed to cancel'),
  })

  const registrations = data?.registrations || []
  const now = new Date()
  
  const upcoming = registrations.filter(r => r.status === 'confirmed' && r.event?.date && new Date(r.event.date) > now)
  const past = registrations.filter(r => r.status === 'confirmed' && r.event?.date && new Date(r.event.date) <= now)
  const cancelled = registrations.filter(r => r.status === 'cancelled')

  const display = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">My Events</h1>
        <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', value: upcoming.length, color: 'sky' },
          { label: 'Attended', value: past.length, color: 'emerald' },
          { label: 'Cancelled', value: cancelled.length, color: 'zinc' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} className="text-sky-400" />
            <h2 className="section-title">Recent Notifications</h2>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 3).map((n, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                n.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20' :
                n.type === 'deadline' ? 'bg-red-500/10 border border-red-500/20' :
                'bg-sky-500/10 border border-sky-500/20'
              }`}>
                <span className="text-base">{n.type === 'warning' ? '⚠️' : n.type === 'deadline' ? '⏰' : '🔔'}</span>
                <p className={n.type === 'warning' ? 'text-amber-300' : n.type === 'deadline' ? 'text-red-300' : 'text-sky-300'}>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registrations */}
      <div className="card overflow-hidden">
        <div className="border-b border-zinc-800">
          <div className="flex">
            {[
              { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { key: 'past', label: `Past (${past.length})` },
              { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${tab === t.key ? 'text-sky-400 border-b-2 border-sky-500' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : display.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No {tab} events</p>
            {tab === 'upcoming' && (
              <Link to="/" className="btn-primary mt-4 inline-block text-sm">Browse Events</Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {display.map(reg => (
              <div key={reg._id} className="p-5 hover:bg-zinc-800/20 transition-colors flex items-start gap-4">
                {/* Category icon */}
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {CATEGORY_EMOJIS[reg.event?.category] || '📅'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/events/${reg.event?._id}`} className="font-semibold text-zinc-200 hover:text-sky-400 transition-colors line-clamp-1">
                        {reg.event?.title || 'Event'}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Calendar size={11} /> {reg.event?.date ? getEventDateLabel(reg.event.date) : '—'}
                        </span>
                        {reg.event?.location?.city && (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin size={11} /> {reg.event.location.type === 'online' ? 'Online' : reg.event.location.city}
                          </span>
                        )}
                      </div>
                    </div>
                    {reg.status === 'confirmed' && tab === 'upcoming' && (
                      <button
                        onClick={() => { if (confirm('Cancel this registration?')) cancelMutation.mutate(reg.event._id) }}
                        className="shrink-0 p-1.5 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-zinc-600 font-mono">
                      <Ticket size={11} /> {reg.ticketCode}
                    </span>
                    <span className={`badge text-xs ${reg.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                      {reg.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Missing useState import fix
import { useState } from 'react'