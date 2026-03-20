import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'

function AdminDashboard() {
  const [totals, setTotals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
        icon={ShieldCheck}
        title="Admin Dashboard"
        subtitle="Manage users, catalog, and system overview."
      />
      {isLoading ? <SkeletonLoader lines={4} /> : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && totals ? (
        <div className="stats-grid">
          <KpiCard label="Listings" value={totals.listings} />
          <KpiCard label="Orders" value={totals.orders} />
          <KpiCard label="Shipments" value={totals.shipments} />
          <KpiCard label="Trips" value={totals.trips} />
          <KpiCard label="Demand Posts" value={totals.demand_posts} />
        </div>
      ) : null}
      {!isLoading && !error && !totals ? <EmptyState title="No dashboard totals yet" description="Data will appear when records are available." /> : null}
    </div>
  )
}

export default AdminDashboard
