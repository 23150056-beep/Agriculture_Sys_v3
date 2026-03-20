import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/authApi'
import ErrorState from '../../components/common/ErrorState'
import { ROLES } from '../../utils/constants'
import Toast from '../../components/common/Toast'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: ROLES.BUYER, full_name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await registerUser(form)
      setMessage('Account created. Redirecting to login...')
      setTimeout(() => navigate('/login'), 700)
    } catch {
      setError('Registration failed. Check your details and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="auth-card">
      <h1 className="auth-title"><UserPlus size={19} /> Register</h1>
      <p className="auth-subtitle">Create an account with your role to access module-specific workflows.</p>
      <form onSubmit={onSubmit}>
        <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value={ROLES.FARMER}>Farmer</option>
          <option value={ROLES.BUYER}>Buyer</option>
          <option value={ROLES.DISPATCHER}>Dispatcher</option>
        </select>
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Account'}</button>
      </form>
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
    </section>
  )
}

export default RegisterPage
