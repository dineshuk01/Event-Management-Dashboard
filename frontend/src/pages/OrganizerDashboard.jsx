import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Calendar, Users, TrendingUp, Eye, Edit, Trash2, Send, BarChart3, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { formatDate, getCategoryColor, getStatusColor, getCapacityColor, formatPrice, timeAgo } from '../utils/helpers'

function StatCard({ icon: Icon, label, value, color = 'sky', sub }) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center`}>
        <Icon size={20} className={`text-${color}-400`} />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
        <p className="text-sm text-zinc-500">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const { registrationCounts } = useSocket()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastEvent, setBroadcastEvent] = useState(null)

  const { data: stats } = useQuery({
    queryKey: ['organizer-stats'],
    queryFn: () => api.get('/events/stats/overview').then(r => r.data),
  })

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['my-events', statusFilter],
    queryFn: () => api.get('/events/my-events', { params: { status: statusFilter === 'all' ? undefined : statusFilter } }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success('Event deleted')
      queryClient.invalidateQueries(['my-events'])
      queryClient.invalidateQueries(['organizer-stats'])
    },
    onError: () => toast.error('Delete failed'),
  })

  const broadcastMutation = useMutation({
    mutationFn: ({ eventId, message }) => api.post(`/notifications/broadcast/${eventId}`, { message }),
    onSuccess: (res) => {
      toast.success(res.data.message)
      setBroadcastMsg('')
      setBroadcastEvent(null)
    },
    onError: () => toast.error('Broadcast failed'),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/events/${id}`, { status }),
    onSuccess: () => {
      toast.success('Status updated')
      queryClient.invalidateQueries(['my-events'])
    },
  })

  const events = eventsData?.events || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Organizer Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/organizer/events/create" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Events" value={stats?.totalEvents ?? '—'} color="sky" />
        <StatCard icon={Eye} label="Published" value={stats?.publishedEvents ?? '—'} color="emerald" />
        <StatCard icon={Users} label="Total Registrations" value={stats?.totalRegistrations ?? '—'} color="violet" />
        <StatCard icon={TrendingUp} label="Upcoming" value={stats?.upcomingEvents ?? '—'} color="amber" />
      </div>

      {/* Recent registrations */}
      {stats?.recentRegistrations?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <div className="dot-live" /> Recent Registrations
          </h2>
          <div className="space-y-2">
            {stats.recentRegistrations.slice(0, 5).map(reg => (
              <div key={reg._id} className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {reg.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{reg.user?.name}</p>
                    <p className="text-xs text-zinc-500">{reg.event?.title}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-600">{timeAgo(reg.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="section-title">My Events</h2>
          <div className="flex gap-2">
            {['all', 'published', 'draft', 'cancelled', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No events yet</p>
            <Link to="/organizer/events/create" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              <Plus size={14} /> Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Registrations</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {events.map(event => {
                  const liveCount = registrationCounts[event._id] ?? event.registrationCount
                  return (
                    <tr key={event._id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-zinc-200 text-sm line-clamp-1">{event.title}</p>
                          <span className={`badge mt-1 ${getCategoryColor(event.category)}`}>{event.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell text-sm text-zinc-400">{formatDate(event.date)}</td>
                      <td className="px-4 py-4">
                        <span className={`badge ${getStatusColor(event.status)}`}>{event.status}</span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className={`text-sm font-mono font-medium ${getCapacityColor(liveCount, event.capacity)}`}>
                          {liveCount}/{event.capacity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/events/${event._id}`} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors" title="View">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/organizer/events/${event._id}/edit`} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => setBroadcastEvent(event)}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-sky-400 transition-colors"
                            title="Notify attendees"
                          >
                            <Send size={15} />
                          </button>
                          {event.status === 'draft' && (
                            <button
                              onClick={() => toggleStatusMutation.mutate({ id: event._id, status: 'published' })}
                              className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => { if (confirm('Delete this event?')) deleteMutation.mutate(event._id) }}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {broadcastEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="card w-full max-w-md p-6 space-y-4 animate-slide-in">
            <h3 className="font-bold text-zinc-100">Notify Attendees</h3>
            <p className="text-sm text-zinc-400">Send a notification to all registrants of <strong className="text-zinc-200">"{broadcastEvent.title}"</strong></p>
            <textarea
              value={broadcastMsg}
              onChange={e => setBroadcastMsg(e.target.value)}
              placeholder="Your message to attendees..."
              rows={4}
              className="input resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setBroadcastEvent(null); setBroadcastMsg('') }} className="btn-secondary text-sm">Cancel</button>
              <button
                onClick={() => broadcastMutation.mutate({ eventId: broadcastEvent._id, message: broadcastMsg })}
                disabled={!broadcastMsg.trim() || broadcastMutation.isPending}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Send size={14} /> {broadcastMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}