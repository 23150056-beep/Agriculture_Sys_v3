import { useCallback, useEffect, useMemo, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getLocations } from '../../api/catalogApi'
import { getListings } from '../../api/listingsApi'
import DynamicAutoRefreshBadge from '../../components/dynamic/AutoRefreshBadge'
import SavedViewPicker from '../../components/dynamic/SavedViewPicker'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import { getMyOrders } from '../../api/ordersApi'
import { createOrder } from '../../api/ordersApi'
import ProgressStepper from '../../components/common/ProgressStepper'
import StatusBadge from '../../components/common/StatusBadge'
import PageHeader from '../../components/common/PageHeader'
import Toast from '../../components/common/Toast'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUSES } from '../../utils/constants'
import heroImage from '../../assets/hero.png'
import { getProduceFallbackImage } from '../../utils/produceImage'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import useSavedViews from '../../hooks/useSavedViews'

function BuyerOrdersPage() {
  const [searchParams] = useSearchParams()
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
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const {
    views,
    selectedView,
    selectedViewId,
    setSelectedViewId,
    saveView,
    deleteView,
  } = useSavedViews('saved-views-orders-buyer')

  const listingById = useMemo(() => listings.reduce((acc, item) => {
    acc[item.id] = item
    return acc
  }, {}), [listings])

  const getOrderProductName = (order) => (
    order.listing_product_name
    || listingById[order.listing]?.product_name
    || `Product #${order.listing}`
  )

  const getOrderImage = (order) => {
    const productName = getOrderProductName(order)
    return order.listing_image || listingById[order.listing]?.images?.[0]?.image || getProduceFallbackImage(productName, heroImage)
  }

  const filteredOrders = orders.filter((order) => {
    const textMatch = `${order.id}`.includes(query) || `${order.status}`.toLowerCase().includes(query.toLowerCase())
    if (!textMatch) return false
    if (statusFilter === 'ALL') return true
    return order.status === statusFilter
  })

  const statuses = ['ALL', ...new Set(orders.map((order) => order.status))]

  const loadData = useCallback(async () => {
    try {
      const [ordersResponse, listingsResponse, locationsResponse] = await Promise.all([getMyOrders(), getListings(), getLocations()])
      setOrders(ordersResponse.data)
      setListings(listingsResponse.data)
      setLocations(locationsResponse.data)
      setError('')
    } catch {
      setError('Failed to load order data')
    } finally {
      setLoading(false)
    }
  }, [])

  const { isActive, setIsActive, lastUpdated, refreshNow } = useAutoRefresh(loadData, {
    intervalMs: 60000,
  })

  useEffect(() => {
    refreshNow()
  }, [refreshNow])

  useEffect(() => {
    if (!message && !error) return
    const timer = setTimeout(() => {
      setMessage('')
      setError('')
    }, 3500)

    return () => clearTimeout(timer)
  }, [message, error])

  useEffect(() => {
    const nextQuery = searchParams.get('q') || ''
    const nextStatus = searchParams.get('status') || 'ALL'
    setQuery(nextQuery)
    setStatusFilter(nextStatus)
  }, [searchParams])

  useEffect(() => {
    if (!selectedView) return
    setQuery(selectedView.filters.query || '')
    setStatusFilter(selectedView.filters.statusFilter || 'ALL')
  }, [selectedView])

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
      <DynamicAutoRefreshBadge
        active={isActive}
        seconds={60}
        lastUpdated={lastUpdated}
        onToggle={() => setIsActive((prev) => !prev)}
        onRefresh={refreshNow}
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
        <div className="chip-row">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`chip ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <SavedViewPicker
          views={views}
          selectedViewId={selectedViewId}
          onSelect={setSelectedViewId}
          onSave={(name) => saveView(name, { query, statusFilter })}
          onDelete={deleteView}
        />
      </FilterBar>
      {loading ? <SkeletonLoader lines={4} variant="table" /> : null}
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={filteredOrders}
          emptyFallback={<EmptyState title="No orders found" description="Create an order above to get started." />}
          columns={[
            { key: 'id', label: 'Order', render: (order) => <Link to={`/orders/${order.id}`}>#{order.id}</Link> },
            {
              key: 'thumbnail',
              label: 'Image',
              render: (order) => (
                <img
                  className="table-thumb"
                  src={getOrderImage(order)}
                  alt={getOrderProductName(order)}
                  loading="lazy"
                  onError={(event) => { event.currentTarget.src = getProduceFallbackImage(getOrderProductName(order), heroImage) }}
                />
              ),
            },
            { key: 'product', label: 'Product', render: (order) => getOrderProductName(order) },
            { key: 'status', label: 'Status', render: (order) => <StatusBadge value={order.status} /> },
            { key: 'lifecycle', label: 'Lifecycle', render: (order) => <ProgressStepper steps={ORDER_STATUSES} current={order.status} /> },
            { key: 'total_price', label: 'Total', render: (order) => formatCurrency(order.total_price) },
            { key: 'expected_delivery_date', label: 'Expected Delivery' },
          ]}
        />
      </div>
      <div className="mobile-card-list">
        {filteredOrders.map((order) => (
          <ImageCard
            key={order.id}
            image={getOrderImage(order)}
            fallback={getProduceFallbackImage(getOrderProductName(order), heroImage)}
            title={`Order #${order.id} - ${getOrderProductName(order)}`}
          >
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Total:</strong> {formatCurrency(order.total_price)}</p>
            <p><strong>Expected:</strong> {order.expected_delivery_date || 'N/A'}</p>
            <ProgressStepper steps={ORDER_STATUSES} current={order.status} />
            <Link to={`/orders/${order.id}`}>View Timeline</Link>
          </ImageCard>
        ))}
      </div>
    </section>
  )
}

export default BuyerOrdersPage
