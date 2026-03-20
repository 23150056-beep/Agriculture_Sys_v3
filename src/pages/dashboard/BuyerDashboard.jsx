import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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

function BuyerDashboard() {
  const navigate = useNavigate()
  const [totals, setTotals] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const statuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED']
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
        title="Buyer Dashboard"
        subtitle="Monitor orders and sourcing opportunities."
      />
      <HeroBanner
        imageSrc={heroImage}
        title="Buyer Command Center"
        subtitle="Track demand, place orders, and monitor delivery progress from one view."
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
            title="Order Pipeline"
            summary="Click a status to open buyer orders filtered to that stage."
            points={chartPoints}
            range="Current"
            labels={statuses}
            onPointSelect={(_, label) => navigate(`/orders/buyer?status=${encodeURIComponent(label)}`)}
          />
        </>
      ) : null}
      {!isLoading && !error && !totals ? <EmptyState title="No buyer metrics yet" description="Metrics appear once data is available." /> : null}
    </div>
  )
}

export default BuyerDashboard
