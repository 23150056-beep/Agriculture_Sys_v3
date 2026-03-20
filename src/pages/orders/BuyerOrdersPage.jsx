import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getLocations } from '../../api/catalogApi'
import { getListings } from '../../api/listingsApi'
import { getMyOrders } from '../../api/ordersApi'
import { createOrder } from '../../api/ordersApi'
import StatusBadge from '../../components/common/StatusBadge'
import PageHeader from '../../components/common/PageHeader'
import { formatCurrency } from '../../utils/formatCurrency'

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

      {message ? <p>{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <p className="section-label">Order History</p>
      <ul className="list">
        {orders.map((order) => (
          <li key={order.id}>
            <Link to={`/orders/${order.id}`}>Order #{order.id}</Link>
            <StatusBadge value={order.status} />
            <span> Total: {formatCurrency(order.total_price)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BuyerOrdersPage
