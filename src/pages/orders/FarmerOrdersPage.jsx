import { useCallback, useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import DynamicAutoRefreshBadge from '../../components/dynamic/AutoRefreshBadge'
import ExportCenter from '../../components/dynamic/ExportCenter'
import SavedViewPicker from '../../components/dynamic/SavedViewPicker'
import DataTable from '../../components/common/DataTable'
import EmptyState from '../../components/common/EmptyState'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import ImageCard from '../../components/common/ImageCard'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import { getFarmerOrders, updateOrderStatus } from '../../api/ordersApi'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Toast from '../../components/common/Toast'
import heroImage from '../../assets/hero.png'
import { getProduceFallbackImage } from '../../utils/produceImage'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import useSavedViews from '../../hooks/useSavedViews'

const STATUS_OPTIONS = ['CONFIRMED', 'PACKED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']

function FarmerOrdersPage() {
  const [searchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrderIds, setSelectedOrderIds] = useState([])
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [loading, setLoading] = useState(true)

  const {
    views,
    selectedView,
    selectedViewId,
    setSelectedViewId,
    saveView,
    deleteView,
  } = useSavedViews('saved-views-orders-farmer')

  const getOrderProductName = (order) => order.listing_product_name || `Product #${order.listing}`
  const getOrderImage = (order) => order.listing_image || getProduceFallbackImage(getOrderProductName(order), heroImage)

  const filteredOrders = orders.filter((order) => {
    const textMatch = `${order.id}`.includes(query) || `${order.status}`.toLowerCase().includes(query.toLowerCase())
    if (!textMatch) return false
    if (statusFilter === 'ALL') return true
    return order.status === statusFilter
  })

  const statuses = ['ALL', ...new Set(orders.map((order) => order.status))]
  const allFilteredSelected = filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderIds.includes(order.id))

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await getFarmerOrders()
      setOrders(data)
      setError('')
    } catch {
      setError('Failed to load farmer orders')
    } finally {
      setLoading(false)
    }
  }, [])

  const { isActive, setIsActive, lastUpdated, refreshNow } = useAutoRefresh(loadOrders, {
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

  useEffect(() => {
    setSelectedOrderIds((prev) => prev.filter((id) => orders.some((order) => order.id === id)))
  }, [orders])

  const toggleSelectOrder = (orderId, checked) => {
    setSelectedOrderIds((prev) => {
      if (checked) return [...new Set([...prev, orderId])]
      return prev.filter((id) => id !== orderId)
    })
  }

  const toggleSelectAllFiltered = (checked) => {
    const filteredIds = filteredOrders.map((order) => order.id)
    setSelectedOrderIds((prev) => {
      if (checked) return [...new Set([...prev, ...filteredIds])]
      return prev.filter((id) => !filteredIds.includes(id))
    })
  }

  const onBulkUpdate = async () => {
    if (!bulkStatus) {
      setError('Select a target status for bulk update.')
      return
    }
    if (!selectedOrderIds.length) {
      setError('Select at least one order for bulk update.')
      return
    }

    setError('')
    setMessage('')
    setBulkUpdating(true)

    const results = await Promise.allSettled(
      selectedOrderIds.map((orderId) => updateOrderStatus(orderId, { status: bulkStatus, note: 'Bulk updated by farmer module' })),
    )

    const successCount = results.filter((result) => result.status === 'fulfilled').length
    const failedCount = results.length - successCount

    if (successCount > 0) {
      setMessage(`${successCount} order${successCount > 1 ? 's' : ''} updated to ${bulkStatus}`)
    }
    if (failedCount > 0) {
      setError(`${failedCount} update${failedCount > 1 ? 's' : ''} failed due to transition rules or server validation.`)
    }

    await refreshNow()
    setBulkUpdating(false)
    if (failedCount === 0) {
      setSelectedOrderIds([])
      setBulkStatus('')
    }
  }

  const onStatusChange = async (orderId, status) => {
    setError('')
    setMessage('')
    try {
      await updateOrderStatus(orderId, { status, note: 'Updated by farmer module' })
      setMessage(`Order #${orderId} updated to ${status}`)
      refreshNow()
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
      <DynamicAutoRefreshBadge
        active={isActive}
        seconds={60}
        lastUpdated={lastUpdated}
        onToggle={() => setIsActive((prev) => !prev)}
        onRefresh={refreshNow}
      />
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}
      <FilterBar>
        <input
          placeholder="Search farmer orders"
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
        <ExportCenter
          title="Export CSV"
          filename="farmer-orders.csv"
          columns={[
            { key: 'id', label: 'Order ID' },
            { key: 'product', label: 'Product' },
            { key: 'status', label: 'Status' },
            { key: 'expected_delivery_date', label: 'Expected Delivery' },
          ]}
          rows={filteredOrders.map((order) => ({
            id: order.id,
            product: getOrderProductName(order),
            status: order.status,
            expected_delivery_date: order.expected_delivery_date || 'N/A',
          }))}
        />
        <div className="bulk-actions">
          <span>{selectedOrderIds.length} selected</span>
          <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
            <option value="">Bulk status</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="button" onClick={onBulkUpdate} disabled={bulkUpdating || !selectedOrderIds.length || !bulkStatus}>
            {bulkUpdating ? 'Applying...' : 'Apply to Selected'}
          </button>
          <button type="button" className="chip" onClick={() => setSelectedOrderIds([])} disabled={bulkUpdating || !selectedOrderIds.length}>Clear</button>
        </div>
      </FilterBar>
      {loading ? <SkeletonLoader lines={4} variant="table" /> : null}
      <div className="desktop-list">
        <DataTable
          rowKey="id"
          rows={filteredOrders}
          emptyFallback={<EmptyState title="No farmer orders" description="Orders tied to your listings will appear here." />}
          columns={[
            {
              key: 'select',
              label: (
                <input
                  type="checkbox"
                  aria-label="Select all filtered orders"
                  checked={allFilteredSelected}
                  onChange={(event) => toggleSelectAllFiltered(event.target.checked)}
                />
              ),
              render: (order) => (
                <input
                  type="checkbox"
                  aria-label={`Select order ${order.id}`}
                  checked={selectedOrderIds.includes(order.id)}
                  onChange={(event) => toggleSelectOrder(order.id, event.target.checked)}
                />
              ),
            },
            { key: 'id', label: 'Order', render: (order) => `#${order.id}` },
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
        {filteredOrders.map((order) => (
          <ImageCard
            key={order.id}
            image={getOrderImage(order)}
            fallback={getProduceFallbackImage(getOrderProductName(order), heroImage)}
            title={`Order #${order.id} - ${getOrderProductName(order)}`}
          >
            <label className="row-check">
              <input
                type="checkbox"
                checked={selectedOrderIds.includes(order.id)}
                onChange={(event) => toggleSelectOrder(order.id, event.target.checked)}
              />
              Select for bulk update
            </label>
            <p><strong>Status:</strong> {order.status}</p>
            <select defaultValue="" onChange={(event) => onStatusChange(order.id, event.target.value)}>
              <option value="" disabled>Update status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </ImageCard>
        ))}
      </div>
    </section>
  )
}

export default FarmerOrdersPage
