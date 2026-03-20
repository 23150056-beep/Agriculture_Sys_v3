import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import { getOrderTimeline } from '../../api/ordersApi'
import PageHeader from '../../components/common/PageHeader'
import Timeline from '../../components/common/Timeline'

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
      {timeline.length > 0 ? <Timeline items={timeline} /> : <EmptyState title="No timeline events" description="No status changes recorded for this order yet." />}
    </section>
  )
}

export default OrderDetailsPage
