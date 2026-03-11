import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, SlidersHorizontal, X, Calendar, TrendingUp } from 'lucide-react'
import api from '../utils/api'
import EventCard from '../components/shared/EventCard'
import { CATEGORIES } from '../utils/helpers'
import { useSocket } from '../context/SocketContext'

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const { connected } = useSocket()

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [search, category])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { search, category, page }],
    queryFn: () => api.get('/events', { params: { search, category: category === 'all' ? undefined : category, page, limit: 12 } }).then(r => r.data),
    keepPreviousData: true
  })

  const { data: featuredData } = useQuery({
    queryKey: ['featured-events'],
    queryFn: () => api.get('/events/featured').then(r => r.data),
  })

  const events = data?.events || []
  const total = data?.total || 0
  const pages = data?.pages || 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="mb-10 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-violet-500/5 rounded-3xl" />
        </div>
        <div className="text-center py-12 px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="dot-live" />
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
              {connected ? 'Live updates enabled' : 'Real-time events'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Discover <span className="gradient-text">Amazing Events</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Find and join events that inspire you. Real-time seat availability. Instant registration.
          </p>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="input pl-10"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                category === cat.value
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured section */}
      {!search && category === 'all' && featuredData?.events?.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-amber-400" />
            <h2 className="section-title">Featured Events</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredData.events.slice(0, 3).map(e => <EventCard key={e._id} event={e} />)}
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8">
            <h2 className="section-title mb-4">All Events</h2>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-72 animate-pulse">
              <div className="h-44 bg-zinc-800 rounded-t-2xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-zinc-500">
          <p>Failed to load events. Please try again.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">No events found</p>
          <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500">{total} event{total !== 1 ? 's' : ''} found</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(e => <EventCard key={e._id} event={e} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">
                Previous
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(pages, 7))].map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-sky-500 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-2 px-4 text-sm disabled:opacity-40">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}