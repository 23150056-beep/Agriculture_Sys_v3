import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import AutoRefreshBadge from '../../components/common/AutoRefreshBadge'
import { getDispatcherOverview, getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import HeroBanner from '../../components/common/HeroBanner'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import heroImage from '../../assets/hero.png'

function DispatcherDashboard() {
  const [totals, setTotals] = useState(null)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSummary(), getDispatcherOverview()])
      .then(([summaryResponse, overviewResponse]) => {
        setTotals(summaryResponse.data.totals)
        setOverview(overviewResponse.data)
        setError('')
      })
      .catch(() => {
        setTotals(null)
        setOverview(null)
        setError('Failed to load dispatcher overview')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={Truck}
        title="Dispatcher Dashboard"
        subtitle="Assign shipments, manage trips, and update delivery status."
      />
      <HeroBanner
        imageSrc={heroImage}
        title="Dispatch Control"
        subtitle="Balance pending shipments and trip capacity with live status visibility."
      >
        <AutoRefreshBadge seconds={60} active />
      </HeroBanner>
      {loading ? <SkeletonLoader lines={3} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && (overview || totals) ? (
        <div className="stats-grid">
          <KpiCard label="My Trips" value={overview?.my_trips ?? 0} trend={3} />
          <KpiCard label="Pending Assignment" value={overview?.pending_assignment ?? 0} trend={1} />
          <KpiCard label="Total Shipments" value={totals?.shipments ?? 0} trend={4} />
        </div>
      ) : null}
      {!loading && !error && !overview && !totals ? <EmptyState title="No dispatcher metrics" description="Metrics appear once trip and shipment records exist." /> : null}
    </div>
  )
}

export default DispatcherDashboard
