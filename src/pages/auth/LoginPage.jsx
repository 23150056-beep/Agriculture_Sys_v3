import { useEffect, useState } from 'react'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../api/authApi'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(''), 3500)
    return () => clearTimeout(timer)
  }, [error])

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const { data } = await loginUser(form)
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('refreshToken', data.refresh)
      navigate('/dashboard')
      window.location.reload()
    } catch {
      setError('Invalid credentials')
    }
  }

  return (
    <section className="auth-card">
      <h1 className="auth-title"><LogIn size={19} /> Login</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Sign In</button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </section>
  )
}

export default LoginPage
