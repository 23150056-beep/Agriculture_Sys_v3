import { useEffect, useState } from 'react'
import { MapPinned } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { createProofOfDelivery, getShipments, updateShipmentStatus } from '../../api/logisticsApi'
import ExportCenter from '../../components/dynamic/ExportCenter'
import ErrorState from '../../components/common/ErrorState'
import FilterBar from '../../components/common/FilterBar'
import EmptyState from '../../components/common/EmptyState'
import PageHeader from '../../components/common/PageHeader'
import ProgressStepper from '../../components/common/ProgressStepper'
import StatusBadge from '../../components/common/StatusBadge'
import Toast from '../../components/common/Toast'
import { getApiErrorMessage } from '../../utils/apiError'

const STATUS_OPTIONS = ['SCHEDULED', 'LOADED', 'IN_TRANSIT', 'DELAYED', 'FAILED', 'DELIVERED']
const SHIPMENT_STEPS = ['SCHEDULED', 'LOADED', 'IN_TRANSIT', 'DELIVERED']

function ShipmentTrackingPage() {
  const [searchParams] = useSearchParams()
  const [shipments, setShipments] = useState([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updatingShipmentId, setUpdatingShipmentId] = useState(null)
  const [podSubmittingShipmentId, setPodSubmittingShipmentId] = useState(null)

  const loadData = () => {
    getShipments()
      .then(({ data }) => setShipments(data))
      .catch((error) => setError(getApiErrorMessage(error, 'Failed to load shipments')))
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

  useEffect(() => {
    const nextQuery = searchParams.get('q') || ''
    const nextStatus = searchParams.get('status') || 'ALL'
    setQuery(nextQuery)
    setStatusFilter(nextStatus)
  }, [searchParams])

  const statuses = ['ALL', ...new Set(shipments.map((shipment) => shipment.status))]
  const filteredShipments = shipments.filter((shipment) => {
    const textMatch = `${shipment.id}`.includes(query) || `${shipment.order}`.includes(query) || `${shipment.status}`.toLowerCase().includes(query.toLowerCase())
    if (!textMatch) return false
    if (statusFilter === 'ALL') return true
    return shipment.status === statusFilter
  })

  const onStatusChange = async (shipmentId, status) => {
    setError('')
    setMessage('')
    setUpdatingShipmentId(shipmentId)
    const previousShipments = shipments

    setShipments((prev) => prev.map((item) => {
      if (item.id !== shipmentId) return item
      return { ...item, status }
    }))

    try {
      await updateShipmentStatus(shipmentId, { status })
      setMessage(`Shipment #${shipmentId} status set to ${status}`)
      loadData()
    } catch (error) {
      setShipments(previousShipments)
      setError(getApiErrorMessage(error, 'Shipment status update failed'))
    } finally {
      setUpdatingShipmentId(null)
    }
  }

  const onPodSubmit = async (event, shipmentId) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError('')
    setMessage('')
    setPodSubmittingShipmentId(shipmentId)
    try {
      await createProofOfDelivery(shipmentId, form)
      setShipments((prev) => prev.map((item) => {
        if (item.id !== shipmentId) return item
        return { ...item, status: 'DELIVERED' }
      }))
      setMessage(`Proof of delivery uploaded for shipment #${shipmentId}`)
      event.currentTarget.reset()
      loadData()
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to upload proof of delivery'))
    } finally {
      setPodSubmittingShipmentId(null)
    }
  }

  return (
    <section className="panel">
      <PageHeader icon={MapPinned} title="Shipment Tracking" subtitle="Track shipment statuses and upload proof of delivery." />
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}

      <FilterBar>
        <input
          placeholder="Search shipment by id, order, or status"
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
        <ExportCenter
          title="Export CSV"
          filename="shipments-tracking.csv"
          columns={[
            { key: 'id', label: 'Shipment ID' },
            { key: 'order', label: 'Order ID' },
            { key: 'status', label: 'Status' },
            { key: 'trip', label: 'Trip ID' },
            { key: 'eta', label: 'ETA' },
          ]}
          rows={filteredShipments.map((shipment) => ({
            id: shipment.id,
            order: shipment.order,
            status: shipment.status,
            trip: shipment.trip || 'Unassigned',
            eta: shipment.eta || 'N/A',
          }))}
        />
      </FilterBar>

      <ul className="list">
        {filteredShipments.map((shipment) => (
          <li key={shipment.id} className={`card ${updatingShipmentId === shipment.id || podSubmittingShipmentId === shipment.id ? 'pending-row' : ''}`}>
            <div className="list-row">
              <span>
                Shipment #{shipment.id} order #{shipment.order} status <StatusBadge value={shipment.status} />
                {updatingShipmentId === shipment.id || podSubmittingShipmentId === shipment.id ? <em className="sync-text"> Syncing...</em> : null}
              </span>
              <select
                defaultValue=""
                onChange={(event) => onStatusChange(shipment.id, event.target.value)}
                disabled={updatingShipmentId === shipment.id}
              >
                <option value="" disabled>Update status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <form className="inline-form pod-form" onSubmit={(event) => onPodSubmit(event, shipment.id)}>
              <input name="receiver_name" placeholder="Receiver name" required />
              <input name="delivered_at" type="datetime-local" required />
              <input name="note" placeholder="Delivery note" />
              <input name="photo" type="file" accept="image/*" required disabled={podSubmittingShipmentId === shipment.id} />
              <button type="submit" disabled={podSubmittingShipmentId === shipment.id}>
                {podSubmittingShipmentId === shipment.id ? 'Uploading...' : 'Upload POD'}
              </button>
            </form>
            <ProgressStepper steps={SHIPMENT_STEPS} current={SHIPMENT_STEPS.includes(shipment.status) ? shipment.status : 'SCHEDULED'} />
          </li>
        ))}
      </ul>
      {shipments.length > 0 && filteredShipments.length === 0 ? <EmptyState title="No matching shipments" description="Try another status or search text." /> : null}
    </section>
  )
}

export default ShipmentTrackingPage
