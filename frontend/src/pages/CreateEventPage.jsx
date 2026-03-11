import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import api from '../utils/api'
import EventForm from '../components/organizer/EventForm'

export default function CreateEventPage() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (data) => api.post('/events', data),
    onSuccess: (res) => {
      toast.success('Event created successfully!')
      navigate(`/events/${res.data.event._id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create event'),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 mb-6 transition-colors text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="page-title mb-8">Create New Event</h1>
      <EventForm
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={mutation.isPending}
        submitLabel="Create Event"
      />
    </div>
  )
}