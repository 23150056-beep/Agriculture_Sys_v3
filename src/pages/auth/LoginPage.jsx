import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/authApi'
import { isDemoMode, setStoredDemoUser, tryDemoLogin } from '../../utils/demoAuth'
import heroImage from '../../assets/hero.png'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 3500)
    return () => clearTimeout(timer)
  }, [error])

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    const demoUser = tryDemoLogin(form.username, form.password)
    if (demoUser) {
      setStoredDemoUser(demoUser)
      setSaving(false)
      navigate('/dashboard')
      window.location.reload()
      return
    }

    try {
      const { data } = await loginUser(form)
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      navigate('/dashboard')
      window.location.reload()
    } catch {
      setError(isDemoMode() ? 'Use demo accounts and password demo12345 on GitHub live' : 'Invalid credentials')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-visual">
        <img src={heroImage} alt="Agriculture platform" loading="lazy" />
      </div>
      <h1 className="auth-title"><LogIn size={19} /> Login</h1>
      <p className="auth-subtitle">Access your dashboard, operations, and marketplace modules.</p>
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" disabled={saving}>{saving ? 'Signing In...' : 'Sign In'}</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {isDemoMode() ? <p className="auth-note">Demo login: demo_admin / demo12345</p> : null}
    </section>
  )
}

export default LoginPage
