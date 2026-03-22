import api from './axios'

export const getListings = () => api.get('/listings/')
export const createListing = (payload) => api.post('/listings/', payload)
export const getMyListings = () => api.get('/listings/distributor/mine/')
export const getListingById = (id) => api.get(`/listings/${id}/`)
export const updateListing = (id, payload) => api.patch(`/listings/${id}/`, payload)
