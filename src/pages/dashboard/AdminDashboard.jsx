import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { getSummary } from '../../api/dashboardApi'
import PageHeader from '../../components/common/PageHeader'

function AdminDashboard() {
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    getSummary().then(({ data }) => setTotals(data.totals)).catch(() => setTotals(null))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={ShieldCheck}
        title="Admin Dashboard"
        subtitle="Manage users, catalog, and system overview."
      />
      {totals ? (
        <div className="stats-grid">
          <article className="card"><h3>Listings</h3><p>{totals.listings}</p></article>
          <article className="card"><h3>Orders</h3><p>{totals.orders}</p></article>
          <article className="card"><h3>Shipments</h3><p>{totals.shipments}</p></article>
          <article className="card"><h3>Trips</h3><p>{totals.trips}</p></article>
          <article className="card"><h3>Demand Posts</h3><p>{totals.demand_posts}</p></article>
        </div>
      ) : null}
    </div>
  )
}

export default AdminDashboard
