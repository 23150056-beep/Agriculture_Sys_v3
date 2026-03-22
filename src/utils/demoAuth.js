import { ROLES } from './constants'

const DEMO_PASSWORD = 'demo12345'
const DEMO_USER_STORAGE_KEY = 'demoUser'

const DEMO_USERS = {
  demo_admin: {
    username: 'demo_admin',
    role: ROLES.ADMIN,
    full_name: 'Demo Admin',
    email: 'demo_admin@example.com',
    phone: '09170000001',
  },
  demo_manager_1: {
    username: 'demo_manager_1',
    role: ROLES.MANAGER,
    full_name: 'Demo Manager One',
    email: 'demo_manager_1@example.com',
    phone: '09170000002',
  },
  demo_manager_2: {
    username: 'demo_manager_2',
    role: ROLES.MANAGER,
    full_name: 'Demo Manager Two',
    email: 'demo_manager_2@example.com',
    phone: '09170000003',
  },
  demo_distributor_1: {
    username: 'demo_distributor_1',
    role: ROLES.DISTRIBUTOR,
    full_name: 'Demo Distributor One',
    email: 'demo_distributor_1@example.com',
    phone: '09170000004',
  },
  demo_distributor_2: {
    username: 'demo_distributor_2',
    role: ROLES.DISTRIBUTOR,
    full_name: 'Demo Distributor Two',
    email: 'demo_distributor_2@example.com',
    phone: '09170000005',
  },
}

export const isDemoMode = () => {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_DEMO_MODE === 'true') return true
  return window.location.hostname.endsWith('github.io')
}

export const tryDemoLogin = (username, password) => {
  if (!isDemoMode()) return null
  if (password !== DEMO_PASSWORD) return null
  return DEMO_USERS[username] || null
}

export const getStoredDemoUser = () => {
  const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const setStoredDemoUser = (user) => {
  localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearStoredAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem(DEMO_USER_STORAGE_KEY)
}
