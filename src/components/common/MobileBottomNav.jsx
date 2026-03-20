import { Link } from 'react-router-dom'
import { LayoutDashboard, Megaphone, ShoppingBag, Store, Truck, UserRound } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function MobileBottomNav({ user }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
      <Link to="/dashboard"><LayoutDashboard size={16} /><span>Home</span></Link>
      <Link to="/marketplace"><Store size={16} /><span>Listings</span></Link>
      {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/orders/buyer"><ShoppingBag size={16} /><span>Orders</span></Link> : null}
      {user?.role === ROLES.FARMER || user?.role === ROLES.ADMIN ? <Link to="/orders/farmer"><ShoppingBag size={16} /><span>Orders</span></Link> : null}
      {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/demand-board"><Megaphone size={16} /><span>Demand</span></Link> : null}
      {user?.role === ROLES.DISPATCHER || user?.role === ROLES.ADMIN ? <Link to="/logistics/dispatch-board"><Truck size={16} /><span>Dispatch</span></Link> : null}
      <Link to="/profile"><UserRound size={16} /><span>Profile</span></Link>
    </nav>
  )
}

export default MobileBottomNav
