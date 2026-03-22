import api from './axios'
import { isDemoMode } from '../utils/demoAuth'

const DEMO_SUMMARY = {
	users: { role: 'ADMIN' },
	totals: {
		listings: 21,
		orders: 8,
		shipments: 8,
		trips: 3,
		demand_posts: 5,
	},
}

const DEMO_DISTRIBUTOR_OVERVIEW = {
	my_listings: 21,
	orders_on_my_listings: 8,
}

const DEMO_MANAGER_OVERVIEW = {
	my_trips: 3,
	pending_assignment: 2,
}

const shouldUseFallback = (error) => isDemoMode() || !error?.response

const getWithFallback = async (path, fallbackData) => {
	try {
		return await api.get(path)
	} catch (error) {
		if (shouldUseFallback(error)) {
			return { data: fallbackData }
		}
		throw error
	}
}

export const getSummary = () => getWithFallback('/dashboard/summary/', DEMO_SUMMARY)
export const getDistributorOverview = () => getWithFallback('/dashboard/distributor/overview/', DEMO_DISTRIBUTOR_OVERVIEW)
export const getManagerOverview = () => getWithFallback('/dashboard/manager/overview/', DEMO_MANAGER_OVERVIEW)
export const getActivityEvents = () => api.get('/dashboard/activity/')
export const createActivityEvent = (payload) => api.post('/dashboard/activity/', payload)
export const clearActivityEvents = () => api.delete('/dashboard/activity/')

// Backward-compatible aliases used by existing page components.
export const getFarmerOverview = getDistributorOverview
export const getDispatcherOverview = getManagerOverview
