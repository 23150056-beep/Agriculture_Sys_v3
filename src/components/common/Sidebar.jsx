import { Link } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, Megaphone, PackagePlus, Store, Truck } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function Sidebar({ user }) {
  return (
    <aside className="sidebar">
      <h3>Modules</h3>
      <Link to="/dashboard"><LayoutDashboard size={16} />Dashboard</Link>
      <Link to="/marketplace"><Store size={16} />Listings</Link>
      {user?.role === ROLES.FARMER || user?.role === ROLES.ADMIN ? <Link to="/listings/new"><PackagePlus size={16} />Create Listing</Link> : null}
      {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/orders/buyer"><ClipboardList size={16} />Buyer Orders</Link> : null}
      {user?.role === ROLES.FARMER || user?.role === ROLES.ADMIN ? <Link to="/orders/farmer"><ClipboardList size={16} />Farmer Orders</Link> : null}
      {user?.role === ROLES.DISPATCHER || user?.role === ROLES.ADMIN ? <Link to="/logistics/dispatch-board"><Truck size={16} />Logistics</Link> : null}
      {user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN ? <Link to="/demand-board"><Megaphone size={16} />Demand Board</Link> : null}
    </aside>
  )
}

export default Sidebar
