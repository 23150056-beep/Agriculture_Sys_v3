import { NavLink } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, Megaphone, PackagePlus, Store, Truck } from 'lucide-react'
import { ROLES } from '../../utils/constants'

function Sidebar({ user }) {
  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <p className="sidebar-eyebrow">FarmVista Ops</p>
        <h3>Control Center</h3>
      </div>

      <div className="sidebar-group">
        <p className="sidebar-group-title">Core Modules</p>
        <NavLink to="/dashboard" className={linkClass}><LayoutDashboard size={16} />Dashboard</NavLink>
        <NavLink to="/marketplace" className={linkClass}><Store size={16} />Listings</NavLink>
        {(user?.role === ROLES.MANAGER || user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? <NavLink to="/demand-board" className={linkClass}><Megaphone size={16} />Demand Board</NavLink> : null}
      </div>

      {(user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) ? (
        <div className="sidebar-group">
          <p className="sidebar-group-title">Distributor</p>
          <NavLink to="/listings/new" className={linkClass}><PackagePlus size={16} />Create Listing</NavLink>
          <NavLink to="/requests/new" className={linkClass}><ClipboardList size={16} />New Request</NavLink>
          <NavLink to="/requests/mine" className={linkClass}><ClipboardList size={16} />My Requests</NavLink>
        </div>
      ) : null}

      {(user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN) ? (
        <div className="sidebar-group">
          <p className="sidebar-group-title">Manager</p>
          <NavLink to="/requests/queue" className={linkClass}><ClipboardList size={16} />Manager Queue</NavLink>
          <NavLink to="/distribution/board" className={linkClass}><Truck size={16} />Distribution</NavLink>
        </div>
      ) : null}

      {user?.role === ROLES.ADMIN ? (
        <div className="sidebar-group">
          <p className="sidebar-group-title">Admin</p>
          <NavLink to="/admin/reports" className={linkClass}><LayoutDashboard size={16} />Whole Report</NavLink>
        </div>
      ) : null}
    </aside>
  )
}

export default Sidebar
