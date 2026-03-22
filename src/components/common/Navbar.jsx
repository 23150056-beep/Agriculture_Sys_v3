import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, PackageSearch, ShoppingBag, Truck, UserRound } from 'lucide-react'
import { ROLES } from '../../utils/constants'
import { clearStoredAuth } from '../../utils/demoAuth'
import useNotificationFeed from '../../hooks/useNotificationFeed'
import DensityToggle from '../dynamic/DensityToggle'
import KeyboardShortcuts from '../dynamic/KeyboardShortcuts'
import NotificationCenter from '../dynamic/NotificationCenter'

function Navbar({ user, onOpenPalette, densityMode, onChangeDensity }) {
  const navigate = useNavigate()
  const { items: notifications, refresh } = useNotificationFeed(user)

  const onLogout = () => {
    clearStoredAuth()
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
        {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <Link to="/requests/mine" className="nav-item"><ShoppingBag size={16} />My Requests</Link> : null}
        {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/requests/queue" className="nav-item"><ShoppingBag size={16} />Queue</Link> : null}
        {(user?.role === ROLES.MANAGER || user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? <Link to="/demand-board" className="nav-item"><LayoutDashboard size={16} />Demand Board</Link> : null}
        {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/distribution/board" className="nav-item"><Truck size={16} />Distribution</Link> : null}
        <Link to="/profile" className="nav-item"><UserRound size={16} />Profile</Link>
      </nav>
      <div className="user-meta">
        <DensityToggle mode={densityMode} onChange={onChangeDensity} />
        <KeyboardShortcuts onOpenPalette={onOpenPalette} />
        <NotificationCenter
          items={notifications}
          onRefresh={refresh}
          onOpenItem={(item) => {
            if (!item?.href) return
            navigate(item.href)
          }}
        />
        <span>{user?.full_name || user?.username || 'Guest'}</span>
        {user ? <button onClick={onLogout}>Logout</button> : <Link to="/login">Login</Link>}
      </div>
    </header>
  )
}

export default Navbar
