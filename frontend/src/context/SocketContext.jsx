import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [registrationCounts, setRegistrationCounts] = useState({})
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    socketRef.current = io(import.meta.env.VITE_API_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('event_registration_count', ({ eventId, count }) => {
      setRegistrationCounts(prev => ({ ...prev, [eventId]: count }))
    })

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev])
      toast(notification.message, {
        icon: notification.type === 'warning' ? '⚠️' : notification.type === 'deadline' ? '⏰' : '🔔',
        duration: 6000,
      })
    })

    socket.on('new_registration', ({ eventTitle, userName, registrationCount }) => {
      toast.success(`${userName} registered for "${eventTitle}"`, { duration: 4000 })
    })

    socket.on('new_event', (event) => {
      toast(`New event: "${event.title}"`, { icon: '🎉', duration: 5000 })
    })

    return () => socket.disconnect()
  }, [user])

  const joinEventRoom = (eventId) => socketRef.current?.emit('join_event_room', eventId)
  const leaveEventRoom = (eventId) => socketRef.current?.emit('leave_event_room', eventId)

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, registrationCounts, notifications, joinEventRoom, leaveEventRoom }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)