import { Link } from 'react-router-dom'
import { LayoutDashboard, Megaphone, ShoppingBag, Store, Truck, UserRound } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function MobileBottomNav({ user }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
      <Link to="/dashboard"><LayoutDashboard size={16} /><span>Home</span></Link>
      <Link to="/marketplace"><Store size={16} /><span>Listings</span></Link>
      {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <Link to="/requests/mine"><ShoppingBag size={16} /><span>Requests</span></Link> : null}
      {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/requests/queue"><ShoppingBag size={16} /><span>Queue</span></Link> : null}
      {(user?.role === ROLES.MANAGER || user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? <Link to="/demand-board"><Megaphone size={16} /><span>Demand</span></Link> : null}
      {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/distribution/board"><Truck size={16} /><span>Distribution</span></Link> : null}
      <Link to="/profile"><UserRound size={16} /><span>Profile</span></Link>
    </nav>
  )
}

export default MobileBottomNav
