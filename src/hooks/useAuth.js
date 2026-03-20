import { useEffect, useState } from 'react'
import { getMe } from '../api/authApi'
import { getStoredDemoUser } from '../utils/demoAuth'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demoUser = getStoredDemoUser()
    if (demoUser) {
      setUser(demoUser)
      setLoading(false)
      return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setLoading(false)
      return
    }

    getMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, setUser, loading }
}
