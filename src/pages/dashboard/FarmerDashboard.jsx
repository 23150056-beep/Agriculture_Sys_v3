import { useEffect, useMemo, useState } from 'react'
import { Tractor } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AutoRefreshBadge from '../../components/common/AutoRefreshBadge'
import DrilldownChartCard from '../../components/charts/DrilldownChartCard'
import { getFarmerOverview, getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import HeroBanner from '../../components/common/HeroBanner'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import heroImage from '../../assets/hero.png'

function FarmerDashboard() {
  const navigate = useNavigate()
  const [totals, setTotals] = useState(null)
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const statuses = ['CONFIRMED', 'PACKED', 'IN_TRANSIT', 'DELIVERED']
  const chartPoints = useMemo(() => {
    const base = overview?.orders_on_my_listings || 0
    if (!base) return [0, 0, 0, 0]
    return [
      Math.round(base * 0.35),
      Math.round(base * 0.25),
      Math.round(base * 0.24),
      Math.round(base * 0.16),
    ]
  }, [overview])

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
      <HeroBanner
        imageSrc={heroImage}
        title="Farm Operations Snapshot"
        subtitle="Watch inventory movement and prioritize listing updates by urgency."
      >
        <AutoRefreshBadge seconds={60} active />
      </HeroBanner>
      {loading ? <SkeletonLoader lines={3} /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}
      {!loading && !error && (overview || totals) ? (
        <>
          <div className="stats-grid">
            <KpiCard label="My Listings" value={overview?.my_listings ?? 0} trend={4} />
            <KpiCard label="Orders On My Listings" value={overview?.orders_on_my_listings ?? 0} trend={6} />
            <KpiCard label="Total Market Listings" value={totals?.listings ?? 0} trend={2} />
          </div>
          <DrilldownChartCard
            title="Fulfillment Flow"
            summary="Click a stage to open farmer orders with that status filter."
            points={chartPoints}
            range="Current"
            labels={statuses}
            onPointSelect={(_, label) => navigate(`/orders/farmer?status=${encodeURIComponent(label)}`)}
          />
        </>
      ) : null}
      {!loading && !error && !overview && !totals ? <EmptyState title="No farmer metrics" description="Metrics appear once listing and order data is present." /> : null}
    </div>
  )
}

export default FarmerDashboard
