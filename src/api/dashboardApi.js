import api from './axios'

export const getSummary = () => api.get('/dashboard/summary/')
export const getDistributorOverview = () => api.get('/dashboard/distributor/overview/')
export const getManagerOverview = () => api.get('/dashboard/manager/overview/')
export const getActivityEvents = () => api.get('/dashboard/activity/')
export const createActivityEvent = (payload) => api.post('/dashboard/activity/', payload)
export const clearActivityEvents = () => api.delete('/dashboard/activity/')

// Backward-compatible aliases used by existing page components.
export const getFarmerOverview = getDistributorOverview
export const getDispatcherOverview = getManagerOverview
