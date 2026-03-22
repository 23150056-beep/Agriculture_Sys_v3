import { Link } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, Megaphone, PackagePlus, Store, Truck } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function Sidebar({ user }) {
  return (
    <aside className="sidebar">
      <h3>Modules</h3>
      <Link to="/dashboard"><LayoutDashboard size={16} />Dashboard</Link>
      <Link to="/marketplace"><Store size={16} />Listings</Link>
      {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <Link to="/listings/new"><PackagePlus size={16} />Create Listing</Link> : null}
      {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <Link to="/requests/new"><ClipboardList size={16} />New Request</Link> : null}
      {user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN ? <Link to="/requests/mine"><ClipboardList size={16} />My Requests</Link> : null}
      {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/requests/queue"><ClipboardList size={16} />Manager Queue</Link> : null}
      {user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN ? <Link to="/distribution/board"><Truck size={16} />Distribution</Link> : null}
      {(user?.role === ROLES.MANAGER || user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? <Link to="/demand-board"><Megaphone size={16} />Demand Board</Link> : null}
    </aside>
  )
}

export default Sidebar
