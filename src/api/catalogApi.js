import api from './axios'

export const getProducts = () => api.get('/products/')
export const getCategories = () => api.get('/categories/')
export const getLocations = () => api.get('/locations/')
