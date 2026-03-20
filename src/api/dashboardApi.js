import api from './axios'

export const getSummary = () => api.get('/dashboard/summary/')
export const getFarmerOverview = () => api.get('/dashboard/farmer/overview/')
export const getDispatcherOverview = () => api.get('/dashboard/dispatcher/overview/')
