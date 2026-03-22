import { Link, NavLink, useNavigate } from 'react-router-dom'
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
  const navClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`

  const onLogout = () => {
    clearStoredAuth()
    navigate('/login')
    window.location.reload()
  }

  return (
    <header className="top-nav">
      <Link to="/" className="brand brand-wrap">
        <LayoutDashboard size={18} />
        <span>FarmVista</span>
      </Link>
      <nav>
        <NavLink to="/marketplace" className={navClass}><PackageSearch size={16} />Marketplace</NavLink>
        {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <NavLink to="/requests/mine" className={navClass}><ShoppingBag size={16} />My Requests</NavLink> : null}
        {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <NavLink to="/requests/queue" className={navClass}><ShoppingBag size={16} />Queue</NavLink> : null}
        {(user?.role === ROLES.MANAGER || user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? <NavLink to="/demand-board" className={navClass}><LayoutDashboard size={16} />Demand Board</NavLink> : null}
        {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <NavLink to="/distribution/board" className={navClass}><Truck size={16} />Distribution</NavLink> : null}
        <NavLink to="/profile" className={navClass}><UserRound size={16} />Profile</NavLink>
      </nav>
      <div className="user-meta">
        <p className="user-meta-label">Live Operations</p>
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
        <span className="user-name">{user?.full_name || user?.username || 'Guest'}</span>
        {user ? <button onClick={onLogout}>Logout</button> : <Link to="/login">Login</Link>}
      </div>
    </header>
  )
}

export default Navbar
