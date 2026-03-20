import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocations } from '../../api/catalogApi'
import { getListings } from '../../api/listingsApi'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import MobileDataCard from '../../components/common/MobileDataCard'
import { getMyOrders } from '../../api/ordersApi'
import { createOrder } from '../../api/ordersApi'
import ProgressStepper from '../../components/common/ProgressStepper'
import StatusBadge from '../../components/common/StatusBadge'
import PageHeader from '../../components/common/PageHeader'
import Toast from '../../components/common/Toast'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUSES } from '../../utils/constants'

function BuyerOrdersPage() {
  const [orders, setOrders] = useState([])
  const [listings, setListings] = useState([])
  const [locations, setLocations] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    listing: '',
    quantity: '10',
    delivery_location: '',
    expected_delivery_date: '',
  })
  const [query, setQuery] = useState('')

  const loadData = () => {
    Promise.all([getMyOrders(), getListings(), getLocations()])
      .then(([ordersResponse, listingsResponse, locationsResponse]) => {
        setOrders(ordersResponse.data)
        setListings(listingsResponse.data)
        setLocations(locationsResponse.data)
      })
      .catch(() => setError('Failed to load order data'))
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      await createOrder({
        listing: Number(form.listing),
        quantity: Number(form.quantity),
        delivery_location: Number(form.delivery_location),
        expected_delivery_date: form.expected_delivery_date,
      })
      setMessage('Order created successfully')
      loadData()
    } catch {
      setError('Failed to create order. Check quantity and required fields.')
    }
  }

  return (
    <section className="panel">
      <PageHeader
        icon={ShoppingCart}
        title="Buyer Orders"
        subtitle="Create and monitor purchase orders from marketplace listings."
      />

      <p className="section-label">Create New Order</p>

      <form className="inline-form" onSubmit={onSubmit}>
        <select name="listing" value={form.listing} onChange={onChange} required>
          <option value="">Select listing</option>
          {listings.map((item) => (
            <option key={item.id} value={item.id}>
              #{item.id} {item.product_name || item.product} - {item.quantity_available} {item.unit} - {formatCurrency(item.unit_price)}
            </option>
          ))}
        </select>
        <input name="quantity" type="number" min="0.01" step="0.01" value={form.quantity} onChange={onChange} required />
        <select name="delivery_location" value={form.delivery_location} onChange={onChange} required>
          <option value="">Select delivery location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.barangay}, {location.city_municipality}, {location.province}
            </option>
          ))}
        </select>
        <input name="expected_delivery_date" type="date" value={form.expected_delivery_date} onChange={onChange} required />
        <button type="submit">Create Order</button>
      </form>

      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}

      <p className="section-label">Order History</p>
      <FilterBar>
        <input
          placeholder="Search by order id or status"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </FilterBar>
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={orders.filter((order) => `${order.id}`.includes(query) || `${order.status}`.toLowerCase().includes(query.toLowerCase()))}
          emptyFallback={<EmptyState title="No orders found" description="Create an order above to get started." />}
          columns={[
            { key: 'id', label: 'Order', render: (order) => <Link to={`/orders/${order.id}`}>#{order.id}</Link> },
            { key: 'status', label: 'Status', render: (order) => <StatusBadge value={order.status} /> },
            { key: 'lifecycle', label: 'Lifecycle', render: (order) => <ProgressStepper steps={ORDER_STATUSES} current={order.status} /> },
            { key: 'total_price', label: 'Total', render: (order) => formatCurrency(order.total_price) },
            { key: 'expected_delivery_date', label: 'Expected Delivery' },
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
              rows={[
                { label: 'Status', value: order.status },
                { label: 'Total', value: formatCurrency(order.total_price) },
                { label: 'Expected', value: order.expected_delivery_date || 'N/A' },
              ]}
              actions={
                <>
                  <ProgressStepper steps={ORDER_STATUSES} current={order.status} />
                  <Link to={`/orders/${order.id}`}>View Timeline</Link>
                </>
              }
            />
          ))}
      </div>
    </section>
  )
}

export default BuyerOrdersPage
