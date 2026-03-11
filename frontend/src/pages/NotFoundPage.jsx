import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold gradient-text mb-4">404</p>
      <h1 className="text-2xl font-bold text-zinc-200 mb-2">Page not found</h1>
      <p className="text-zinc-500 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary flex items-center gap-2">
        <Home size={16} /> Go Home
      </Link>
    </div>
  )
}