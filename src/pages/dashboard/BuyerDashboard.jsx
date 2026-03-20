import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { getSummary } from '../../api/dashboardApi'
import PageHeader from '../../components/common/PageHeader'

function BuyerDashboard() {
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    getSummary().then(({ data }) => setTotals(data.totals)).catch(() => setTotals(null))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={ShoppingCart}
        title="Buyer Dashboard"
        subtitle="Monitor orders and sourcing opportunities."
      />
      {totals ? (
        <div className="stats-grid">
          <article className="card"><h3>Open Listings</h3><p>{totals.listings}</p></article>
          <article className="card"><h3>Total Orders</h3><p>{totals.orders}</p></article>
          <article className="card"><h3>Demand Posts</h3><p>{totals.demand_posts}</p></article>
        </div>
      ) : null}
    </div>
  )
}

export default BuyerDashboard
