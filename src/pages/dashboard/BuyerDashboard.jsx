import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ActivityPanel from '../../components/common/ActivityPanel'
import AutoRefreshBadge from '../../components/common/AutoRefreshBadge'
import DrilldownChartCard from '../../components/charts/DrilldownChartCard'
import { getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import HeroBanner from '../../components/common/HeroBanner'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import heroImage from '../../assets/hero.png'
import useActivityLog from '../../hooks/useActivityLog'

function BuyerDashboard() {
  const navigate = useNavigate()
  const [totals, setTotals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { entries: activityEntries } = useActivityLog()

  const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'IN_DELIVERY', 'DELIVERED']
  const chartPoints = useMemo(() => {
    if (!totals) return [0, 0, 0, 0]
    const base = totals.orders || 0
    return [
      Math.round(base * 0.32),
      Math.round(base * 0.24),
      Math.round(base * 0.27),
      Math.round(base * 0.17),
    ]
  }, [totals])

  useEffect(() => {
    getSummary()
      .then(({ data }) => {
        setTotals(data.totals)
        setError('')
      })
      .catch(() => {
        setTotals(null)
        setError('Failed to load dashboard summary')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={ShoppingCart}
        title="Manager Dashboard"
        subtitle="Monitor requests, approvals, and distribution operations."
      />
      <HeroBanner
        imageSrc={heroImage}
        title="Manager Command Center"
        subtitle="Review incoming requests, approve operations, and monitor delivery progress."
      >
        <AutoRefreshBadge seconds={60} active />
      </HeroBanner>
      {isLoading ? <SkeletonLoader lines={3} /> : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && totals ? (
        <>
          <div className="stats-grid">
            <KpiCard label="Open Listings" value={totals.listings} trend={3} />
            <KpiCard label="Total Orders" value={totals.orders} trend={5} />
            <KpiCard label="Demand Posts" value={totals.demand_posts} trend={4} />
          </div>
          <DrilldownChartCard
            title="Request Pipeline"
            summary="Click a status to open the manager queue filtered to that stage."
            points={chartPoints}
            range="Current"
            labels={statuses}
            onPointSelect={(_, label) => navigate(`/requests/queue?status=${encodeURIComponent(label)}`)}
          />
          <ActivityPanel items={activityEntries} title="Manager Activity" />
        </>
      ) : null}
      {!isLoading && !error && !totals ? <EmptyState title="No manager metrics yet" description="Metrics appear once data is available." /> : null}
    </div>
  )
}

export default BuyerDashboard
