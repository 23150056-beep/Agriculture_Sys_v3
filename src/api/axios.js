import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL
const apiVersion = import.meta.env.VITE_API_VERSION
const apiBaseUrl = configuredApiBaseUrl || (apiVersion === 'v4' ? 'http://127.0.0.1:8000/api/v4' : 'http://127.0.0.1:8000/api')

const api = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
