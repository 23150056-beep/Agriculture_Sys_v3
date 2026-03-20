import api from './axios'

export const getSummary = () => api.get('/dashboard/summary/')
export const getFarmerOverview = () => api.get('/dashboard/farmer/overview/')
export const getDispatcherOverview = () => api.get('/dashboard/dispatcher/overview/')
export const getActivityEvents = () => api.get('/dashboard/activity/')
export const createActivityEvent = (payload) => api.post('/dashboard/activity/', payload)
export const clearActivityEvents = () => api.delete('/dashboard/activity/')
