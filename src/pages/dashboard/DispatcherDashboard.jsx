import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import { getDispatcherOverview, getSummary } from '../../api/dashboardApi'
import PageHeader from '../../components/common/PageHeader'

function DispatcherDashboard() {
  const [totals, setTotals] = useState(null)
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    getSummary().then(({ data }) => setTotals(data.totals)).catch(() => setTotals(null))
    getDispatcherOverview().then(({ data }) => setOverview(data)).catch(() => setOverview(null))
  }, [])

  return (
    <div className="panel">
      <PageHeader
        icon={Truck}
        title="Dispatcher Dashboard"
        subtitle="Assign shipments, manage trips, and update delivery status."
      />
      <div className="stats-grid">
        <article className="card"><h3>My Trips</h3><p>{overview?.my_trips ?? '-'}</p></article>
        <article className="card"><h3>Pending Assignment</h3><p>{overview?.pending_assignment ?? '-'}</p></article>
        <article className="card"><h3>Total Shipments</h3><p>{totals?.shipments ?? '-'}</p></article>
      </div>
    </div>
  )
}

export default DispatcherDashboard
