useEffect(() => {
  const token = localStorage.getItem('token')
  const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin

  socketRef.current = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling']
  })
  // ... rest stays the same
}, [user])