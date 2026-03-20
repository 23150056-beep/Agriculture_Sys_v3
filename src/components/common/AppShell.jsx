import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../utils/constants'
import useDensityMode from '../../hooks/useDensityMode'
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts'
import CommandPalette from '../dynamic/CommandPalette'
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

    if (user?.role === ROLES.BUYER || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'buyer-orders', label: 'Open Buyer Orders', onSelect: () => navigate('/orders/buyer'), hint: 'Route', keywords: ['purchase', 'orders'] })
      actions.push({ id: 'demand', label: 'Open Demand Board', onSelect: () => navigate('/demand-board'), hint: 'Route', keywords: ['demand', 'requests'] })
    }

    if (user?.role === ROLES.FARMER || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'farmer-orders', label: 'Open Farmer Orders', onSelect: () => navigate('/orders/farmer'), hint: 'Route', keywords: ['sales', 'fulfillment'] })
      actions.push({ id: 'new-listing', label: 'Create Listing', onSelect: () => navigate('/listings/new'), hint: 'Route', keywords: ['sell', 'post'] })
    }

    if (user?.role === ROLES.DISPATCHER || user?.role === ROLES.ADMIN) {
      actions.push({ id: 'dispatch', label: 'Open Dispatch Board', onSelect: () => navigate('/logistics/dispatch-board'), hint: 'Route', keywords: ['shipments', 'trips'] })
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
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={paletteActions}
      />
    </div>
  )
}

export default AppShell
