import { useState } from 'react'
import { MapPin, Monitor, Wrench } from 'lucide-react'

const CATEGORIES = [
  { value: 'in-person', label: 'In-Person', icon: MapPin, desc: 'Physical venue' },
  { value: 'online', label: 'Online', icon: Monitor, desc: 'Virtual / livestream' },
  { value: 'workshop', label: 'Workshop', icon: Wrench, desc: 'Hands-on learning' },
]

const defaultForm = {
  title: '',
  description: '',
  category: 'in-person',
  date: '',
  endDate: '',
  registrationDeadline: '',
  location: { type: 'physical', city: '', onlineLink: '' },
  capacity: 50,
  price: 0,
  currency: 'USD',
  status: 'published',
  image: '',
  tags: [],
  isFeatured: false,
  agenda: [],
}

export default function EventForm({ initialData = {}, onSubmit, isLoading, submitLabel = 'Create Event' }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialData })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const setLocation = (field, value) => setForm(prev => ({ ...prev, location: { ...prev.location, [field]: value } }))

  const handleCategoryChange = (cat) => {
    set('category', cat)
    if (cat === 'online') setLocation('type', 'online')
    else setLocation('type', 'physical')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const toLocalInput = (isoStr) => {
    if (!isoStr) return ''
    return isoStr.slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Step 1 */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">1</div>
          <h2 className="section-title">What's your event?</h2>
        </div>

        <div>
          <label className="label">Type of event</label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleCategoryChange(value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  form.category === value
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/40'
                }`}
              >
                <Icon size={20} className={form.category === value ? 'text-sky-400' : 'text-zinc-500'} />
                <p className={`font-semibold text-sm mt-2 ${form.category === value ? 'text-zinc-100' : 'text-zinc-400'}`}>{label}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Event name <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="input"
            placeholder="e.g. Morning Yoga Session, Tech Talk, Book Club"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label className="label">Description <span className="text-red-400">*</span></label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="input resize-none"
            rows={4}
            placeholder="Tell people what to expect — what will happen, who should come, what to bring..."
            required
            maxLength={2000}
          />
          <p className="text-xs text-zinc-600 mt-1">{form.description.length}/2000</p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">2</div>
          <h2 className="section-title">When & Where</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date & Time <span className="text-red-400">*</span></label>
            <input
              type="datetime-local"
              value={toLocalInput(form.date)}
              onChange={e => set('date', e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">End Time <span className="text-zinc-600 font-normal">(optional)</span></label>
            <input
              type="datetime-local"
              value={toLocalInput(form.endDate)}
              onChange={e => set('endDate', e.target.value)}
              className="input"
            />
          </div>
        </div>

        {form.category !== 'online' ? (
          <div>
            <label className="label">City / Location</label>
            <input
              type="text"
              value={form.location.city}
              onChange={e => setLocation('city', e.target.value)}
              className="input"
              placeholder="e.g. New York, London, Mumbai"
            />
          </div>
        ) : (
          <div>
            <label className="label">Meeting Link <span className="text-zinc-600 font-normal">(Zoom, Google Meet, etc.)</span></label>
            <input
              type="url"
              value={form.location.onlineLink}
              onChange={e => setLocation('onlineLink', e.target.value)}
              className="input"
              placeholder="https://zoom.us/j/..."
            />
            <p className="text-xs text-zinc-600 mt-1.5">Only registered attendees will see this link</p>
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">3</div>
          <h2 className="section-title">Spots & Price</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Max Attendees <span className="text-red-400">*</span></label>
            <input
              type="number"
              value={form.capacity}
              onChange={e => set('capacity', Math.max(1, parseInt(e.target.value) || 1))}
              className="input"
              min={1}
              required
            />
            <p className="text-xs text-zinc-600 mt-1.5">How many people can join?</p>
          </div>
          <div>
            <label className="label">Ticket Price</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                value={form.price}
                onChange={e => set('price', Math.max(0, parseFloat(e.target.value) || 0))}
                className="input pl-7"
                min={0}
                step={0.01}
              />
            </div>
            <p className="text-xs text-zinc-600 mt-1.5">Set to 0 for a free event</p>
          </div>
        </div>
      </div>

      {/* Step 4 — Optional */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-7 h-7 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center text-sm font-bold">4</div>
          <div>
            <h2 className="section-title">Extra Details</h2>
            <p className="text-xs text-zinc-600 mt-0.5">All optional</p>
          </div>
        </div>

        <div>
          <label className="label">Cover Image URL</label>
          <input
            type="url"
            value={form.image}
            onChange={e => set('image', e.target.value)}
            className="input"
            placeholder="https://images.unsplash.com/..."
          />
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              className="mt-3 h-28 w-full object-cover rounded-xl border border-zinc-700"
              onError={e => e.target.style.display = 'none'}
            />
          )}
        </div>

        <div>
          <label className="label">Visibility</label>
          <div className="flex gap-3">
            {[
              { value: 'published', label: '🌐 Publish now', desc: 'Visible to everyone' },
              { value: 'draft', label: '📝 Save as draft', desc: 'Only you can see it' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('status', opt.value)}
                className={`flex-1 p-3.5 rounded-xl border-2 text-left transition-all ${
                  form.status === opt.value
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <p className={`text-sm font-semibold ${form.status === opt.value ? 'text-zinc-100' : 'text-zinc-400'}`}>{opt.label}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => set('isFeatured', !form.isFeatured)}
            className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.isFeatured ? 'bg-sky-500' : 'bg-zinc-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-200">Feature this event</p>
            <p className="text-xs text-zinc-600">Show at the top of the browse page</p>
          </div>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn-primary px-10">
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>

    </form>
  )
}