import api from './axios'

export const getMyOrders = () => api.get('/orders/my/')
export const getFarmerOrders = () => api.get('/orders/farmer/mine/')
export const createOrder = (payload) => api.post('/orders/', payload)
export const getOrderById = (id) => api.get(`/orders/${id}/`)
export const updateOrderStatus = (id, payload) => api.patch(`/orders/${id}/status/`, payload)
export const getOrderTimeline = (id) => api.get(`/orders/${id}/timeline/`)
