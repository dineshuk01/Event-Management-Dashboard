import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Zap } from 'lucide-react'
import { getCategoryColor, getCapacityBarColor, getCapacityColor, formatPrice, getEventDateLabel, CATEGORY_EMOJIS } from '../../utils/helpers'
import { useSocket } from '../../context/SocketContext'

export default function EventCard({ event }) {
  const { registrationCounts } = useSocket()
  const liveCount = registrationCounts[event._id] ?? event.registrationCount
  const pct = Math.min((liveCount / event.capacity) * 100, 100)
  const isFull = liveCount >= event.capacity
  const isAlmostFull = pct >= 80

  return (
    <Link to={`/events/${event._id}`} className="card-hover flex flex-col group overflow-hidden">
      {/* Image/Header */}
      <div className="relative h-44 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {CATEGORY_EMOJIS[event.category] || '✨'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`badge ${getCategoryColor(event.category)}`}>
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap size={10} /> Featured
            </span>
          )}
        </div>

        {/* Price */}
        <div className="absolute top-3 right-3">
          <span className="badge bg-zinc-900/80 text-zinc-200 backdrop-blur-sm border border-zinc-700/50">
            {formatPrice(event.price, event.currency)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <h3 className="font-bold text-zinc-100 line-clamp-2 group-hover:text-sky-400 transition-colors leading-snug">
            {event.title}
          </h3>
          {event.organizer && (
            <p className="text-xs text-zinc-500 mt-1">by {event.organizer.name}</p>
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar size={12} className="text-sky-500 shrink-0" />
            <span>{getEventDateLabel(event.date)}</span>
          </div>
          {event.location?.city && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <MapPin size={12} className="text-violet-500 shrink-0" />
              <span className="truncate">{event.location.type === 'online' ? 'Online' : `${event.location.city}${event.location.country ? ', ' + event.location.country : ''}`}</span>
            </div>
          )}
        </div>

        {/* Capacity bar */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Users size={12} />
              <span className={getCapacityColor(liveCount, event.capacity)}>
                {isFull ? 'Full' : `${event.capacity - liveCount} spots left`}
              </span>
              {liveCount !== event.registrationCount && (
                <span className="text-sky-400 font-mono animate-count-up">⚡ live</span>
              )}
            </div>
            <span className="text-zinc-500 font-mono">{liveCount}/{event.capacity}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getCapacityBarColor(liveCount, event.capacity)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}