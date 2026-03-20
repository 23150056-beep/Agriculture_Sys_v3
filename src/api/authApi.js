import api from './axios'

export const registerUser = (payload) => api.post('/auth/register/', payload)
export const loginUser = (payload) => api.post('/auth/login/', payload)
export const refreshToken = (refresh) => api.post('/auth/refresh/', { refresh })
export const getMe = () => api.get('/auth/me/')
