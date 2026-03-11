import { format, formatDistanceToNow, isPast, isToday, isTomorrow, differenceInHours } from 'date-fns'

export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy')
export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy · h:mm a')
export const formatTime = (date) => format(new Date(date), 'h:mm a')
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })

export const getEventDateLabel = (date) => {
  const d = new Date(date)
  if (isToday(d)) return `Today · ${formatTime(d)}`
  if (isTomorrow(d)) return `Tomorrow · ${formatTime(d)}`
  return formatDateTime(d)
}

export const getCategoryColor = (category) => {
  const colors = {
    'in-person': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'online': 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    'workshop': 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  }
  return colors[category] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
}

export const getStatusColor = (status) => {
  const colors = {
    published: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    draft: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  }
  return colors[status] || colors.draft
}

export const getCapacityColor = (count, capacity) => {
  const pct = count / capacity
  if (pct >= 1) return 'text-red-400'
  if (pct >= 0.8) return 'text-amber-400'
  return 'text-emerald-400'
}

export const getCapacityBarColor = (count, capacity) => {
  const pct = count / capacity
  if (pct >= 1) return 'bg-red-500'
  if (pct >= 0.8) return 'bg-amber-500'
  return 'bg-emerald-500'
}

export const formatPrice = (price, currency = 'USD') => {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'in-person', label: '📍 In-Person' },
  { value: 'online', label: '💻 Online' },
  { value: 'workshop', label: '🛠 Workshop' },
]

export const CATEGORY_EMOJIS = {
  'in-person': '📍',
  'online': '💻',
  'workshop': '🛠',
}