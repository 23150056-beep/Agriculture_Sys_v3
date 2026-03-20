import api from './axios'

export const getPendingShipments = () => api.get('/shipments/pending-assignment/')
export const getShipments = () => api.get('/shipments/')
export const getTrips = () => api.get('/trips/')
export const getVehicles = () => api.get('/vehicles/')
export const getDrivers = () => api.get('/drivers/')
export const createTrip = (payload) => api.post('/trips/', payload)
export const assignShipment = (payload) => api.post('/shipments/assign-shipment/', payload)
export const capacityCheck = (payload) => api.post('/shipments/capacity-check/', payload)
export const updateShipmentStatus = (id, payload) => api.patch(`/shipments/${id}/status/`, payload)
export const createProofOfDelivery = (shipmentId, formData) =>
	api.post(`/shipments/${shipmentId}/proof-of-delivery/`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
