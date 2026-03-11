import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'organizer' ? '/organizer' : '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-violet-500 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">EventSphere</span>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8 space-y-5">
          {/* Demo credentials */}
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 space-y-1">
            <p className="font-semibold text-sky-400">Demo Accounts:</p>
            <p>Organizer: organizer@demo.com / demo123</p>
            <p>User: user@demo.com / demo123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}