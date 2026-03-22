import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../utils/constants'
import useDensityMode from '../../hooks/useDensityMode'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import CommandPalette from '../dynamic/CommandPalette'
import MobileBottomNav from './MobileBottomNav'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function AppShell({ user, children }) {
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { mode, setMode } = useDensityMode()

  const paletteActions = useMemo(() => {
    const actions = [
      { id: 'dashboard', label: 'Go to Dashboard', onSelect: () => navigate('/dashboard'), hint: 'Route', keywords: ['home', 'overview'] },
      { id: 'marketplace', label: 'Open Marketplace', onSelect: () => navigate('/marketplace'), hint: 'Route', keywords: ['listings', 'products'] },
      { id: 'profile', label: 'Open Profile', onSelect: () => navigate('/profile'), hint: 'Route', keywords: ['account'] },
    ]

    if (user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'my-requests', label: 'Open My Requests', onSelect: () => navigate('/requests/mine'), hint: 'Route', keywords: ['requests', 'orders'] })
      actions.push({ id: 'demand', label: 'Open Demand Board', onSelect: () => navigate('/demand-board'), hint: 'Route', keywords: ['demand', 'requests'] })
    }

    if (user?.role === ROLES.DISTRIBUTOR || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'new-request', label: 'Create Request', onSelect: () => navigate('/requests/new'), hint: 'Route', keywords: ['submit', 'request'] })
      actions.push({ id: 'new-listing', label: 'Create Listing', onSelect: () => navigate('/listings/new'), hint: 'Route', keywords: ['sell', 'post'] })
    }

    if (user?.role === ROLES.MANAGER || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'queue', label: 'Open Approval Queue', onSelect: () => navigate('/requests/queue'), hint: 'Route', keywords: ['approve', 'queue'] })
      actions.push({ id: 'distribution', label: 'Open Distribution Board', onSelect: () => navigate('/distribution/board'), hint: 'Route', keywords: ['shipments', 'trips'] })
    }

    return actions
  }, [navigate, user?.role])

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlOrMeta: true,
      handler: () => setPaletteOpen(true),
    },
    {
      key: 'escape',
      ignoreInInputs: false,
      handler: () => setPaletteOpen(false),
    },
  ])

  useEffect(() => {
    document.documentElement.setAttribute('data-density', mode)
  }, [mode])

  return (
    <div className="layout">
      <Navbar
        user={user}
        onOpenPalette={() => setPaletteOpen(true)}
        densityMode={mode}
        onChangeDensity={setMode}
      />
      <div className="shell">
        <Sidebar user={user} />
        <main>{children}</main>
      </div>
      <MobileBottomNav user={user} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={paletteActions}
      />
    </div>
  )
}

export default AppShell
