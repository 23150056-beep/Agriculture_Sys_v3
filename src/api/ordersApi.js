import api from './axios'

export const getMyRequests = () => api.get('/requests/my/')
export const getDistributorRequests = () => api.get('/requests/distributor/mine/')
export const getManagerQueue = () => api.get('/requests/manager/queue/')
export const createRequest = (payload) => api.post('/requests/', payload)
export const getRequestById = (id) => api.get(`/requests/${id}/`)
export const updateRequestStatus = (id, payload) => api.patch(`/requests/${id}/status/`, payload)
export const approveRequest = (id, payload = {}) => api.post(`/requests/${id}/manager/approve/`, payload)
export const rejectRequest = (id, payload = {}) => api.post(`/requests/${id}/manager/reject/`, payload)
export const confirmRequest = (id, payload = {}) => api.post(`/requests/${id}/confirm/`, payload)
export const getRequestTimeline = (id) => api.get(`/requests/${id}/timeline/`)

// Backward-compatible aliases used by existing page components.
export const getMyOrders = getMyRequests
export const getFarmerOrders = getDistributorRequests
export const createOrder = createRequest
export const getOrderById = getRequestById
export const updateOrderStatus = updateRequestStatus
export const getOrderTimeline = getRequestTimeline
