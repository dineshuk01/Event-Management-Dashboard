import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Eye, EyeOff, User, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const { user } = await register(form.name, form.email, form.password, form.role)
      toast.success(`Welcome, ${user.name}! 🎉`)
      navigate(user.role === 'organizer' ? '/organizer' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-violet-500 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">EventSphere</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Create your account</h1>
          <p className="text-zinc-500 text-sm mt-2">Join thousands of event enthusiasts</p>
        </div>

        <div className="card p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'user', label: 'Attend Events', icon: User, desc: 'Browse and register' },
                { value: 'organizer', label: 'Host Events', icon: Briefcase, desc: 'Create and manage' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.role === opt.value
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <opt.icon size={18} className={form.role === opt.value ? 'text-sky-400' : 'text-zinc-500'} />
                  <p className={`font-semibold text-sm mt-2 ${form.role === opt.value ? 'text-zinc-100' : 'text-zinc-400'}`}>{opt.label}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="John Doe" required minLength={2} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input pr-10" placeholder="Min. 6 characters" required minLength={6} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}