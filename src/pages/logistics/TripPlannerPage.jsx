import { useEffect, useMemo, useState } from 'react'
import { Route } from 'lucide-react'
import { capacityCheck, createTrip, getDrivers, getPendingShipments, getTrips, getVehicles } from '../../api/logisticsApi'
import ErrorState from '../../components/common/ErrorState'
import PageHeader from '../../components/common/PageHeader'
import Toast from '../../components/common/Toast'
import { getApiErrorMessage } from '../../utils/apiError'

function TripPlannerPage() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [trips, setTrips] = useState([])
  const [pendingShipments, setPendingShipments] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [capacityResult, setCapacityResult] = useState(null)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const [isCheckingCapacity, setIsCheckingCapacity] = useState(false)
  const [form, setForm] = useState({ vehicle: '', driver: '', scheduled_date: '' })

  const loadData = () => {
    Promise.all([getVehicles(), getDrivers(), getTrips(), getPendingShipments()])
      .then(([vehiclesResponse, driversResponse, tripsResponse, pendingShipmentsResponse]) => {
        setVehicles(vehiclesResponse.data)
        setDrivers(driversResponse.data)
        setTrips(tripsResponse.data)
        setPendingShipments(pendingShipmentsResponse.data)
      })
      .catch((error) => setError(getApiErrorMessage(error, 'Failed to load trip planner data')))
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

  const suggestedWeights = useMemo(
    () => pendingShipments.slice(0, 3).map(() => 100),
    [pendingShipments],
  )

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onCreateTrip = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsCreatingTrip(true)
    try {
      const { data } = await createTrip({
        vehicle: Number(form.vehicle),
        driver: Number(form.driver),
        scheduled_date: form.scheduled_date,
        status: 'SCHEDULED',
      })
      setTrips((prev) => [data, ...prev])
      setMessage('Trip created successfully')
      setForm({ vehicle: '', driver: '', scheduled_date: '' })
      loadData()
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to create trip. Dispatcher or admin role is required.'))
    } finally {
      setIsCreatingTrip(false)
    }
  }

  const onCapacityCheck = async () => {
    if (!form.vehicle) return
    setError('')
    setIsCheckingCapacity(true)
    try {
      const { data } = await capacityCheck({ vehicle_id: Number(form.vehicle), weights: suggestedWeights })
      setCapacityResult(data.ok)
    } catch (error) {
      setError(getApiErrorMessage(error, 'Capacity check failed'))
      setCapacityResult(null)
    } finally {
      setIsCheckingCapacity(false)
    }
  }

  return (
    <section className={`panel ${isCreatingTrip || isCheckingCapacity ? 'pending-row' : ''}`}>
      <PageHeader icon={Route} title="Trip Planner" subtitle="Create trips and pre-check vehicle capacity against pending loads." />
      {isCreatingTrip || isCheckingCapacity ? <p className="sync-text">Syncing...</p> : null}

      <form className="inline-form" onSubmit={onCreateTrip}>
        <select name="vehicle" value={form.vehicle} onChange={onChange} required>
          <option value="">Select vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate_number} ({vehicle.capacity_kg} kg)
            </option>
          ))}
        </select>

        <select name="driver" value={form.driver} onChange={onChange} required>
          <option value="">Select driver</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>

        <input name="scheduled_date" type="date" value={form.scheduled_date} onChange={onChange} required />
        <button type="button" onClick={onCapacityCheck} disabled={isCheckingCapacity || !form.vehicle}>
          {isCheckingCapacity ? 'Checking...' : 'Capacity Check'}
        </button>
        <button type="submit" disabled={isCreatingTrip || !form.vehicle || !form.driver || !form.scheduled_date}>
          {isCreatingTrip ? 'Creating...' : 'Create Trip'}
        </button>
      </form>

      {capacityResult === true ? <Toast message="Capacity check: PASS" type="success" /> : null}
      {capacityResult === false ? <ErrorState message="Capacity check: EXCEEDED" /> : null}
      <Toast message={message} type="success" />
      {error ? <ErrorState message={error} /> : null}

      <h3>Existing Trips</h3>
      <ul className="list">
        {trips.map((trip) => (
          <li key={trip.id}>Trip #{trip.id} vehicle #{trip.vehicle} driver #{trip.driver} status {trip.status}</li>
        ))}
      </ul>
    </section>
  )
}

export default TripPlannerPage
