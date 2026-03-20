import { useEffect, useState } from 'react'
import { Tractor } from 'lucide-react'
import { getFarmerOverview, getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'

function FarmerDashboard() {
  const [totals, setTotals] = useState(null)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getSummary(), getFarmerOverview()])
      .then(([summaryResponse, overviewResponse]) => {
        setTotals(summaryResponse.data.totals)
        setOverview(overviewResponse.data)
        setError('')
      })
      .catch(() => {
        setTotals(null)
        setOverview(null)
        setError('Failed to load farmer overview')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={Tractor}
        title="Farmer Dashboard"
        subtitle="Track listings, harvest plans, and active orders."
      />
      {loading ? <SkeletonLoader lines={3} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && (overview || totals) ? (
        <div className="stats-grid">
          <KpiCard label="My Listings" value={overview?.my_listings ?? '-'} />
          <KpiCard label="Orders On My Listings" value={overview?.orders_on_my_listings ?? '-'} />
          <KpiCard label="Total Market Listings" value={totals?.listings ?? '-'} />
        </div>
      ) : null}
      {!loading && !error && !overview && !totals ? <EmptyState title="No farmer metrics" description="Metrics appear once listing and order data is present." /> : null}
    </div>
  )
}

export default FarmerDashboard
