import { useState } from 'react'
import { Calendar, MapPin, Users, DollarSign, Tag, Plus, Trash2, Image } from 'lucide-react'

const defaultForm = {
  title: '', description: '', category: 'conference', status: 'draft',
  date: '', endDate: '', registrationDeadline: '',
  location: { type: 'physical', address: '', city: '', country: '', onlineLink: '' },
  capacity: 100, price: 0, currency: 'USD', image: '', tags: [], isFeatured: false,
  agenda: []
}

export default function EventForm({ initialData = {}, onSubmit, isLoading, submitLabel = 'Save Event' }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialData })
  const [tagInput, setTagInput] = useState('')

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const setLocation = (field, value) => setForm(prev => ({ ...prev, location: { ...prev.location, [field]: value } }))
  
  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const addAgendaItem = () => {
    set('agenda', [...form.agenda, { time: '', title: '', description: '', speaker: '' }])
  }

  const updateAgenda = (i, field, value) => {
    const updated = [...form.agenda]
    updated[i] = { ...updated[i], [field]: value }
    set('agenda', updated)
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title">Basic Information</h2>
        
        <div>
          <label className="label">Event Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="Give your event a compelling title" required maxLength={100} />
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none" rows={5} placeholder="Describe your event in detail..." required maxLength={2000} />
          <p className="text-xs text-zinc-600 mt-1">{form.description.length}/2000</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
              {['conference', 'workshop', 'webinar', 'meetup', 'concert', 'sports', 'networking', 'other'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              {['draft', 'published', 'cancelled'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Image URL</label>
          <input type="url" value={form.image} onChange={e => set('image', e.target.value)} className="input" placeholder="https://..." />
          {form.image && <img src={form.image} alt="preview" className="mt-3 h-32 w-full object-cover rounded-xl border border-zinc-700" onError={e => e.target.style.display='none'} />}
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded accent-sky-500" />
          <label htmlFor="featured" className="text-sm text-zinc-400 cursor-pointer">Mark as featured event</label>
        </div>
      </div>

      {/* Date & Time */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title flex items-center gap-2"><Calendar size={16} /> Date & Time</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Start Date & Time *</label>
            <input type="datetime-local" value={toLocalInput(form.date)} onChange={e => set('date', e.target.value)} className="input" required />
          </div>
          <div>
            <label className="label">End Date & Time</label>
            <input type="datetime-local" value={toLocalInput(form.endDate)} onChange={e => set('endDate', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Registration Deadline</label>
            <input type="datetime-local" value={toLocalInput(form.registrationDeadline)} onChange={e => set('registrationDeadline', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title flex items-center gap-2"><MapPin size={16} /> Location</h2>
        <div>
          <label className="label">Event Type</label>
          <div className="flex gap-3">
            {['physical', 'online', 'hybrid'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setLocation('type', t)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${form.location.type === t ? 'bg-sky-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {(form.location.type === 'physical' || form.location.type === 'hybrid') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="label">City</label>
              <input type="text" value={form.location.city} onChange={e => setLocation('city', e.target.value)} className="input" placeholder="New York" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" value={form.location.country} onChange={e => setLocation('country', e.target.value)} className="input" placeholder="USA" />
            </div>
            <div className="sm:col-span-1">
              <label className="label">Address</label>
              <input type="text" value={form.location.address} onChange={e => setLocation('address', e.target.value)} className="input" placeholder="123 Main St" />
            </div>
          </div>
        )}

        {(form.location.type === 'online' || form.location.type === 'hybrid') && (
          <div>
            <label className="label">Online Link</label>
            <input type="url" value={form.location.onlineLink} onChange={e => setLocation('onlineLink', e.target.value)} className="input" placeholder="https://zoom.us/j/..." />
          </div>
        )}
      </div>

      {/* Capacity & Pricing */}
      <div className="card p-6 space-y-5">
        <h2 className="section-title flex items-center gap-2"><Users size={16} /> Capacity & Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Max Capacity *</label>
            <input type="number" value={form.capacity} onChange={e => set('capacity', parseInt(e.target.value))} className="input" min={1} required />
          </div>
          <div>
            <label className="label">Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
              <input type="number" value={form.price} onChange={e => set('price', parseFloat(e.target.value))} className="input pl-7" min={0} step={0.01} />
            </div>
          </div>
          <div>
            <label className="label">Currency</label>
            <select value={form.currency} onChange={e => set('currency', e.target.value)} className="input">
              {['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="card p-6 space-y-4">
        <h2 className="section-title flex items-center gap-2"><Tag size={16} /> Tags</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="input flex-1"
            placeholder="Add a tag..."
          />
          <button type="button" onClick={addTag} className="btn-secondary px-4">Add</button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.tags.map(tag => (
              <span key={tag} className="badge bg-zinc-800 text-zinc-300 border border-zinc-700 gap-1">
                #{tag}
                <button type="button" onClick={() => set('tags', form.tags.filter(t => t !== tag))} className="text-zinc-500 hover:text-red-400 ml-1">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Agenda */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Agenda (optional)</h2>
          <button type="button" onClick={addAgendaItem} className="btn-ghost text-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Item
          </button>
        </div>
        {form.agenda.map((item, i) => (
          <div key={i} className="p-4 bg-zinc-800/50 rounded-xl space-y-3 relative">
            <button type="button" onClick={() => set('agenda', form.agenda.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">Time</label>
                <input type="text" value={item.time} onChange={e => updateAgenda(i, 'time', e.target.value)} className="input text-sm" placeholder="9:00 AM" />
              </div>
              <div>
                <label className="label text-xs">Speaker</label>
                <input type="text" value={item.speaker} onChange={e => updateAgenda(i, 'speaker', e.target.value)} className="input text-sm" placeholder="Speaker name" />
              </div>
            </div>
            <div>
              <label className="label text-xs">Title</label>
              <input type="text" value={item.title} onChange={e => updateAgenda(i, 'title', e.target.value)} className="input text-sm" placeholder="Session title" />
            </div>
            <div>
              <label className="label text-xs">Description</label>
              <input type="text" value={item.description} onChange={e => updateAgenda(i, 'description', e.target.value)} className="input text-sm" placeholder="Brief description" />
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => window.history.back()} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isLoading} className="btn-primary px-8">
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}