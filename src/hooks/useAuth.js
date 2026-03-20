import { useEffect, useState } from 'react'
import { getMe } from '../api/authApi'
import { getStoredDemoUser } from '../utils/demoAuth'

export const useAuth = () => {
  const initialDemoUser = getStoredDemoUser()
  const hasInitialToken = Boolean(localStorage.getItem('accessToken'))
  const [user, setUser] = useState(initialDemoUser)
  const [loading, setLoading] = useState(!initialDemoUser && hasInitialToken)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

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
