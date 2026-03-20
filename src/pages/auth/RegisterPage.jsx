import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../api/authApi'
import { ROLES } from '../../utils/constants'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: ROLES.BUYER, full_name: '', phone: '' })

  const onSubmit = async (event) => {
    event.preventDefault()
    await registerUser(form)
    navigate('/login')
  }

  return (
    <section className="auth-card">
      <h1 className="auth-title"><UserPlus size={19} /> Register</h1>
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
        <button type="submit">Create Account</button>
      </form>
    </section>
  )
}

export default RegisterPage
