import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, PackageSearch, ShoppingBag, Truck, UserRound } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function Navbar({ user }) {
  const navigate = useNavigate()

  const onLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
    window.location.reload()
  }

  return (
    <header className="top-nav">
      <Link to="/" className="brand brand-wrap">
        <LayoutDashboard size={18} />
        <span>Agri Distribution</span>
      </Link>
      <nav>
        <Link to="/marketplace" className="nav-item"><PackageSearch size={16} />Marketplace</Link>
        {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/orders/buyer" className="nav-item"><ShoppingBag size={16} />Buyer Orders</Link> : null}
        {user?.role === ROLES.FARMER || user?.role === ROLES.ADMIN ? <Link to="/orders/farmer" className="nav-item"><ShoppingBag size={16} />Farmer Orders</Link> : null}
        {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/demand-board" className="nav-item"><LayoutDashboard size={16} />Demand Board</Link> : null}
        {user?.role === ROLES.DISPATCHER || user?.role === ROLES.ADMIN ? <Link to="/logistics/dispatch-board" className="nav-item"><Truck size={16} />Dispatch</Link> : null}
        <Link to="/profile" className="nav-item"><UserRound size={16} />Profile</Link>
      </nav>
      <div className="user-meta">
        <span>{user?.full_name || user?.username || 'Guest'}</span>
        {user ? <button onClick={onLogout}>Logout</button> : <Link to="/login">Login</Link>}
      </div>
    </header>
  )
}

export default Navbar
