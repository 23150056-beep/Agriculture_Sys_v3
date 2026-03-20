import { useEffect, useState } from 'react'
import { ListChecks } from 'lucide-react'
import { assignShipment, getPendingShipments, getShipments, getTrips, updateShipmentStatus } from '../../api/logisticsApi'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Toast from '../../components/common/Toast'
import { getApiErrorMessage } from '../../utils/apiError'
import { addActivityLog } from '../../utils/activityLog'
import { getShipmentDelayRisk } from '../../utils/prototypeSignals'

const SHIPMENT_STATUS_OPTIONS = ['SCHEDULED', 'LOADED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'FAILED']

function DispatchBoardPage() {
  const [shipments, setShipments] = useState([])
  const [pendingShipments, setPendingShipments] = useState([])
  const [trips, setTrips] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [assigningShipmentId, setAssigningShipmentId] = useState(null)
  const [updatingShipmentId, setUpdatingShipmentId] = useState(null)

  const loadData = () => {
    Promise.all([getPendingShipments(), getShipments(), getTrips()])
      .then(([pendingResponse, shipmentsResponse, tripsResponse]) => {
        setPendingShipments(pendingResponse.data)
        setShipments(shipmentsResponse.data)
        setTrips(tripsResponse.data)
      })
      .catch((error) => setError(getApiErrorMessage(error, 'Failed to load dispatch data')))
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

  const onAssign = async (shipmentId, tripId) => {
    if (!tripId) return
    setError('')
    setMessage('')
    setAssigningShipmentId(shipmentId)
    const previousShipments = shipments
    const previousPendingShipments = pendingShipments

    setPendingShipments((prev) => prev.filter((item) => item.id !== shipmentId))
    setShipments((prev) => prev.map((item) => {
      if (item.id !== shipmentId) return item
      return { ...item, trip: Number(tripId), status: 'SCHEDULED' }
    }))

    try {
      await assignShipment({ shipment_id: shipmentId, trip_id: Number(tripId) })
      setMessage(`Shipment #${shipmentId} assigned`)
      addActivityLog({ title: `Dispatcher assigned shipment #${shipmentId} to trip #${tripId}` })
      loadData()
    } catch (error) {
      setShipments(previousShipments)
      setPendingShipments(previousPendingShipments)
      setError(getApiErrorMessage(error, 'Failed to assign shipment'))
    } finally {
      setAssigningShipmentId(null)
    }
  }

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
      setMessage(`Shipment #${shipmentId} updated to ${status}`)
      addActivityLog({ title: `Dispatcher updated shipment #${shipmentId} to ${status}` })
      loadData()
    } catch (error) {
      setShipments(previousShipments)
      setError(getApiErrorMessage(error, 'Failed to update shipment status'))
    } finally {
      setUpdatingShipmentId(null)
    }
  }

  return (
    <section className="panel">
      <PageHeader icon={ListChecks} title="Dispatch Board" subtitle="Assign pending shipments and update shipment movement status." />

      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}

      <h3>Pending Assignment</h3>
      <ul className="list">
        {pendingShipments.map((shipment) => (
          <li key={shipment.id} className={`list-row ${assigningShipmentId === shipment.id ? 'pending-row' : ''}`}>
            <span>
              Shipment #{shipment.id} for order #{shipment.order}
              {assigningShipmentId === shipment.id ? <em className="sync-text"> Syncing...</em> : null}
            </span>
            <select
              defaultValue=""
              onChange={(event) => onAssign(shipment.id, event.target.value)}
              disabled={assigningShipmentId === shipment.id}
            >
              <option value="" disabled>Select trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>Trip #{trip.id} ({trip.status})</option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h3>All Shipments</h3>
      <ul className="list">
        {shipments.map((shipment) => (
          <li key={shipment.id} className={`list-row ${updatingShipmentId === shipment.id ? 'pending-row' : ''}`}>
            <span>
              Shipment #{shipment.id} order #{shipment.order} status <StatusBadge value={shipment.status} />
              {' '}
              <em className={`signal-chip ${getShipmentDelayRisk(shipment).tone}`}>Delay risk: {getShipmentDelayRisk(shipment).label}</em>
              {updatingShipmentId === shipment.id ? <em className="sync-text"> Syncing...</em> : null}
            </span>
            <select
              defaultValue=""
              onChange={(event) => onStatusChange(shipment.id, event.target.value)}
              disabled={updatingShipmentId === shipment.id}
            >
              <option value="" disabled>Update status</option>
              {SHIPMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default DispatchBoardPage
