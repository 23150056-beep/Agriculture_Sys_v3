import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { getOrderTimeline } from '../../api/ordersApi'
import PageHeader from '../../components/common/PageHeader'

function OrderDetailsPage() {
  const { id } = useParams()
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    getOrderTimeline(id).then(({ data }) => setTimeline(data)).catch(() => setTimeline([]))
  }, [id])

  return (
    <section className="panel">
      <PageHeader
        icon={History}
        title={`Order Timeline #${id}`}
        subtitle="Trace every status transition for this order."
      />
      <ul className="list">
        {timeline.map((entry) => <li key={entry.id}>{entry.from_status || 'START'} to {entry.to_status}</li>)}
      </ul>
    </section>
  )
}

export default OrderDetailsPage
