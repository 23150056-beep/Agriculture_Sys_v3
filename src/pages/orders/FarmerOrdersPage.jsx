import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { getFarmerOrders, updateOrderStatus } from '../../api/ordersApi'
import PageHeader from '../../components/common/PageHeader'

const STATUS_OPTIONS = ['CONFIRMED', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

function FarmerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadOrders = () => {
    getFarmerOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load farmer orders'))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  const onStatusChange = async (orderId, status) => {
    setError('')
    setMessage('')
    try {
      await updateOrderStatus(orderId, { status, note: 'Updated by farmer module' })
      setMessage(`Order #${orderId} updated to ${status}`)
      loadOrders()
    } catch {
      setError('Could not update order status. Ensure transition is valid.')
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={ClipboardCheck}
        title="Farmer Orders"
        subtitle="Manage status transitions for orders tied to your listings."
      />
      {message ? <p>{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <ul className="list">
        {orders.map((order) => (
          <li key={order.id} className="list-row">
            <span>Order #{order.id} status {order.status}</span>
            <select defaultValue="" onChange={(event) => onStatusChange(order.id, event.target.value)}>
              <option value="" disabled>Update status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FarmerOrdersPage
