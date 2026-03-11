import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, Clock, Tag, ArrowLeft, CheckCircle, ExternalLink, Share2, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { formatDateTime, getCategoryColor, getCapacityBarColor, getCapacityColor, formatPrice, CATEGORY_EMOJIS } from '../utils/helpers'

export default function EventDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { joinEventRoom, leaveEventRoom, registrationCounts } = useSocket()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    joinEventRoom(id)
    return () => leaveEventRoom(id)
  }, [id])

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`).then(r => r.data.event),
  })

  const { data: regData, refetch: refetchReg } = useQuery({
    queryKey: ['registration-check', id],
    queryFn: () => api.get(`/registrations/check/${id}`).then(r => r.data),
    enabled: !!user,
  })

  const registerMutation = useMutation({
    mutationFn: () => api.post(`/registrations/${id}`),
    onSuccess: (res) => {
      toast.success(res.data.message)
      refetchReg()
      queryClient.invalidateQueries(['event', id])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.delete(`/registrations/${id}`),
    onSuccess: () => {
      toast.success('Registration cancelled')
      refetchReg()
      queryClient.invalidateQueries(['event', id])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  })

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-64 bg-zinc-800 rounded-2xl mb-8" />
      <div className="space-y-4">
        <div className="h-8 bg-zinc-800 rounded w-2/3" />
        <div className="h-4 bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  )

  if (!data) return <div className="text-center py-20 text-zinc-500">Event not found</div>

  const event = data
  const liveCount = registrationCounts[event._id] ?? event.registrationCount
  const pct = Math.min((liveCount / event.capacity) * 100, 100)
  const isFull = liveCount >= event.capacity
  const isRegistered = regData?.isRegistered
  const isOrganizer = user?._id === event.organizer?._id || user?._id === event.organizer

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="relative h-64 sm:h-80 bg-zinc-800 rounded-2xl overflow-hidden">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">
                {CATEGORY_EMOJIS[event.category] || '✨'}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-center gap-2">
                <span className={`badge ${getCategoryColor(event.category)}`}>{event.category}</span>
                {event.isFeatured && <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">Featured</span>}
              </div>
              {isOrganizer && (
                <button onClick={() => navigate(`/organizer/events/${event._id}/edit`)} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1.5">
                  <Edit size={14} /> Edit
                </button>
              )}
            </div>
          </div>

          {/* Title & Organizer */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">{event.title}</h1>
            {event.organizer && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-sky-400 to-violet-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {event.organizer.name?.charAt(0)}
                </div>
                <span className="text-sm text-zinc-400">by <span className="text-zinc-200">{event.organizer.name}</span></span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h2 className="section-title mb-3">About this event</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>

          {/* Agenda */}
          {event.agenda?.length > 0 && (
            <div className="card p-6">
              <h2 className="section-title mb-4">Agenda</h2>
              <div className="space-y-3">
                {event.agenda.map((item, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-zinc-800/50 rounded-xl">
                    {item.time && <span className="font-mono text-sky-400 text-sm shrink-0 w-16">{item.time}</span>}
                    <div>
                      <p className="font-medium text-zinc-200 text-sm">{item.title}</p>
                      {item.speaker && <p className="text-xs text-zinc-500 mt-0.5">🎤 {item.speaker}</p>}
                      {item.description && <p className="text-xs text-zinc-500 mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={14} className="text-zinc-500" />
              {event.tags.map(tag => (
                <span key={tag} className="badge bg-zinc-800 text-zinc-400 border border-zinc-700">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Registration Card */}
          <div className="card p-6 sticky top-20 space-y-5">
            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-zinc-100">{formatPrice(event.price, event.currency)}</span>
              <span className={`badge ${event.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-700 text-zinc-400'}`}>
                {event.status}
              </span>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-zinc-400" />
                  <span className={getCapacityColor(liveCount, event.capacity)}>
                    {isFull ? 'Fully booked' : `${event.capacity - liveCount} of ${event.capacity} spots left`}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                  <div className="dot-live w-1.5 h-1.5" /> live
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${getCapacityBarColor(liveCount, event.capacity)}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-zinc-600 font-mono">{liveCount} registered</p>
            </div>

            {/* CTA */}
            {user ? (
              isRegistered ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">You're registered!</span>
                  </div>
                  {regData?.registration?.ticketCode && (
                    <p className="text-xs text-center text-zinc-500 font-mono">{regData.registration.ticketCode}</p>
                  )}
                  <button
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="w-full btn-danger text-sm"
                  >
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Registration'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending || isFull || event.status !== 'published'}
                  className="w-full btn-primary"
                >
                  {registerMutation.isPending ? 'Registering...' : isFull ? 'Event Full' : event.status !== 'published' ? 'Not Available' : 'Register Now'}
                </button>
              )
            ) : (
              <button onClick={() => navigate('/login')} className="w-full btn-primary">
                Sign in to Register
              </button>
            )}

            {event.registrationDeadline && (
              <p className="text-xs text-zinc-500 text-center">
                Registration closes {formatDateTime(event.registrationDeadline)}
              </p>
            )}
          </div>

          {/* Event Details */}
          <div className="card p-5 space-y-4">
            <h3 className="section-title">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Calendar size={15} className="text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-zinc-200">{formatDateTime(event.date)}</p>
                  {event.endDate && <p className="text-zinc-500 text-xs mt-0.5">Until {formatDateTime(event.endDate)}</p>}
                </div>
              </div>
              {event.location && (
                <div className="flex gap-3">
                  <MapPin size={15} className="text-violet-500 shrink-0 mt-0.5" />
                  <div>
                    {event.location.type === 'online' ? (
                      <p className="text-zinc-200">Online Event</p>
                    ) : (
                      <>
                        {event.location.address && <p className="text-zinc-200">{event.location.address}</p>}
                        <p className="text-zinc-400">{[event.location.city, event.location.country].filter(Boolean).join(', ')}</p>
                      </>
                    )}
                    {(event.location.type === 'online' || event.location.type === 'hybrid') && event.location.onlineLink && isRegistered && (
                      <a href={event.location.onlineLink} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1 text-xs">
                        Join Link <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}