import { useEffect, useState } from 'react'
import { Tractor } from 'lucide-react'
import { getFarmerOverview, getSummary } from '../../api/dashboardApi'
import PageHeader from '../../components/common/PageHeader'

function FarmerDashboard() {
  const [totals, setTotals] = useState(null)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    getSummary().then(({ data }) => setTotals(data.totals)).catch(() => setTotals(null))
    getFarmerOverview().then(({ data }) => setOverview(data)).catch(() => setOverview(null))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={Tractor}
        title="Farmer Dashboard"
        subtitle="Track listings, harvest plans, and active orders."
      />
      <div className="stats-grid">
        <article className="card"><h3>My Listings</h3><p>{overview?.my_listings ?? '-'}</p></article>
        <article className="card"><h3>Orders On My Listings</h3><p>{overview?.orders_on_my_listings ?? '-'}</p></article>
        <article className="card"><h3>Total Market Listings</h3><p>{totals?.listings ?? '-'}</p></article>
      </div>
    </div>
  )
}

export default FarmerDashboard
