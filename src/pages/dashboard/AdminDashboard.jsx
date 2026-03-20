import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getSummary } from '../../api/dashboardApi'
import AutoRefreshBadge from '../../components/common/AutoRefreshBadge'
import DrilldownChartCard from '../../components/charts/DrilldownChartCard'
import ActivityPanel from '../../components/common/ActivityPanel'
import EmptyState from '../../components/common/EmptyState'
import HeroBanner from '../../components/common/HeroBanner'
import LiveActivityFeed from '../../components/common/LiveActivityFeed'
import ErrorState from '../../components/common/ErrorState'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import TimeRangeToggle from '../../components/common/TimeRangeToggle'
import heroImage from '../../assets/hero.png'
import useActivityLog from '../../hooks/useActivityLog'

function AdminDashboard() {
  const navigate = useNavigate()
  const [totals, setTotals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('7d')
  const [activity, setActivity] = useState([])
  const [refreshActive, setRefreshActive] = useState(true)
  const { entries: activityEntries } = useActivityLog()

  const loadSummary = () => {
    getSummary()
      .then(({ data }) => {
        const nextTotals = data.totals
        setTotals(nextTotals)
        setError('')
        setActivity((prev) => [
          {
            id: `act-${Date.now()}`,
            title: `Summary refreshed: ${nextTotals.orders} orders, ${nextTotals.shipments} shipments`,
            timeLabel: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 8))
      })
      .catch(() => {
        setTotals(null)
        setError('Failed to load dashboard summary')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadSummary()

    const interval = setInterval(() => {
      if (document.hidden) {
        setRefreshActive(false)
        return
      }
      setRefreshActive(true)
      loadSummary()
    }, 45000)

    return () => clearInterval(interval)
  }, [])

  const trendData = useMemo(() => {
    if (!totals) return { points: [0, 0, 0, 0], summary: 'No trend data yet' }
    const scale = range === 'Today' ? 1 : range === '7d' ? 1.4 : 1.9
    const points = [
      Math.round(totals.orders * 0.5 * scale),
      Math.round(totals.orders * 0.72 * scale),
      Math.round(totals.orders * 0.88 * scale),
      Math.round(totals.orders * scale),
    ]
    return { points, summary: `${totals.orders} orders currently in the system` }
  }, [totals, range])

  const priorityAction = useMemo(() => {
    if (!totals) return '/marketplace'
    const ranking = [
      { key: 'orders', route: '/orders/buyer' },
      { key: 'shipments', route: '/logistics/dispatch-board' },
      { key: 'demand_posts', route: '/demand-board' },
    ]
    ranking.sort((a, b) => (totals[b.key] || 0) - (totals[a.key] || 0))
    return ranking[0].route
  }, [totals])

  const drilldownStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED']
  const opsPulse = useMemo(() => {
    if (!totals) return []
    const pendingOrders = Math.max((totals.orders || 0) - Math.round((totals.shipments || 0) * 0.6), 0)
    const openDemand = totals.demand_posts || 0
    const unassignedShipments = Math.max((totals.shipments || 0) - (totals.trips || 0), 0)
    return [
      { label: 'Pending Orders', value: pendingOrders },
      { label: 'Open Demand', value: openDemand },
      { label: 'Unassigned Shipments', value: unassignedShipments },
    ]
  }, [totals])

  const exceptions = useMemo(() => {
    if (!totals) return []
    const next = []
    if ((totals.demand_posts || 0) > (totals.listings || 0)) {
      next.push({ id: 'ex-demand', tone: 'warning', text: 'Demand volume is higher than active listings. Consider publishing supply updates.' })
    }
    if ((totals.orders || 0) > (totals.shipments || 0) * 2) {
      next.push({ id: 'ex-orders', tone: 'danger', text: 'Order queue looks stalled compared to shipment throughput.' })
    }
    if ((totals.trips || 0) === 0 && (totals.shipments || 0) > 0) {
      next.push({ id: 'ex-trips', tone: 'danger', text: 'No active trips detected while shipments exist.' })
    }
    if (!next.length) {
      next.push({ id: 'ex-clean', tone: 'safe', text: 'No critical exceptions detected right now.' })
    }
    return next
  }, [totals])

  return (
    <div className="panel">
      <PageHeader
        icon={ShieldCheck}
        title="Admin Dashboard"
        subtitle="Manage users, catalog, and system overview."
      />
      <HeroBanner
        imageSrc={heroImage}
        title="Operations Cockpit"
        subtitle="Monitor system flow, prioritize work, and act fast on demand and logistics."
        actions={<Link to={priorityAction}><button type="button">Open Priority Queue</button></Link>}
      >
        <AutoRefreshBadge seconds={45} active={refreshActive} />
      </HeroBanner>
      {isLoading ? <SkeletonLoader lines={4} /> : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && totals ? (
        <>
          <section className="card ops-pulse-strip">
            {opsPulse.map((item) => (
              <article key={item.label}>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>
          <div className="stats-grid">
            <KpiCard label="Listings" value={totals.listings} trend={4} />
            <KpiCard label="Orders" value={totals.orders} trend={7} />
            <KpiCard label="Shipments" value={totals.shipments} trend={3} />
            <KpiCard label="Trips" value={totals.trips} trend={2} />
            <KpiCard label="Demand Posts" value={totals.demand_posts} trend={5} />
          </div>
          <section className="card exception-inbox">
            <div className="exception-head">
              <h3>Exception Mini-Inbox</h3>
              <span>{exceptions.length} item{exceptions.length > 1 ? 's' : ''}</span>
            </div>
            <ul>
              {exceptions.map((item) => (
                <li key={item.id} className={`signal-chip ${item.tone}`}>{item.text}</li>
              ))}
            </ul>
          </section>
          <div className="dashboard-dynamic-grid">
            <div>
              <TimeRangeToggle value={range} onChange={setRange} />
              <DrilldownChartCard
                title="Orders Trend"
                summary={trendData.summary}
                points={trendData.points}
                range={range}
                labels={drilldownStatuses}
                onPointSelect={(_, label) => navigate(`/orders/buyer?status=${encodeURIComponent(label)}`)}
              />
            </div>
            <LiveActivityFeed items={activity} />
          </div>
          <ActivityPanel items={activityEntries} title="Shared Activity Stream" />
        </>
      ) : null}
      {!isLoading && !error && !totals ? <EmptyState title="No dashboard totals yet" description="Data will appear when records are available." /> : null}
    </div>
  )
}

export default AdminDashboard
