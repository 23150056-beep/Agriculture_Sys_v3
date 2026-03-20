import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppShell({ user, children }) {
  return (
    <div className="layout">
      <Navbar user={user} />
      <div className="shell">
        <Sidebar user={user} />
        <main>{children}</main>
      </div>
    </div>
  )
}

export default AppShell
