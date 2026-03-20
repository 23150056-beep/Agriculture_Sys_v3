import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import AutoRefreshBadge from '../../components/common/AutoRefreshBadge'
import { getSummary } from '../../api/dashboardApi'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import HeroBanner from '../../components/common/HeroBanner'
import KpiCard from '../../components/common/KpiCard'
import PageHeader from '../../components/common/PageHeader'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import heroImage from '../../assets/hero.png'

function BuyerDashboard() {
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
        <div className="stats-grid">
          <KpiCard label="Open Listings" value={totals.listings} trend={3} />
          <KpiCard label="Total Orders" value={totals.orders} trend={5} />
          <KpiCard label="Demand Posts" value={totals.demand_posts} trend={4} />
        </div>
      ) : null}
      {!isLoading && !error && !totals ? <EmptyState title="No buyer metrics yet" description="Metrics appear once data is available." /> : null}
    </div>
  )
}

export default BuyerDashboard
