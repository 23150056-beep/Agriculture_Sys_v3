import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import MobileDataCard from '../../components/common/MobileDataCard'
import { getFarmerOrders, updateOrderStatus } from '../../api/ordersApi'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Toast from '../../components/common/Toast'

const STATUS_OPTIONS = ['CONFIRMED', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

function FarmerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')

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
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
      <FilterBar>
        <input
          placeholder="Search farmer orders"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={orders.filter((order) => `${order.id}`.includes(query) || `${order.status}`.toLowerCase().includes(query.toLowerCase()))}
          emptyFallback={<EmptyState title="No farmer orders" description="Orders tied to your listings will appear here." />}
          columns={[
            { key: 'id', label: 'Order', render: (order) => `#${order.id}` },
            { key: 'status', label: 'Status', render: (order) => <StatusBadge value={order.status} /> },
            {
              key: 'action',
              label: 'Update',
              render: (order) => (
                <select defaultValue="" onChange={(event) => onStatusChange(order.id, event.target.value)}>
                  <option value="" disabled>Update status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              ),
            },
          ]}
        />
      </div>
      <div className="mobile-card-list">
        {orders
          .filter((order) => `${order.id}`.includes(query) || `${order.status}`.toLowerCase().includes(query.toLowerCase()))
          .map((order) => (
            <MobileDataCard
              key={order.id}
              title={`Order #${order.id}`}
              rows={[{ label: 'Status', value: order.status }]}
              actions={
                <select defaultValue="" onChange={(event) => onStatusChange(order.id, event.target.value)}>
                  <option value="" disabled>Update status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              }
            />
          ))}
      </div>
    </section>
  )
}

export default FarmerOrdersPage
