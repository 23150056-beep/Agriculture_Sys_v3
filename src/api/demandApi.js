import api from './axios'

export const getDemandPosts = () => api.get('/demand-posts/')
export const createDemandPost = (payload) => api.post('/demand-posts/', payload)
export const createDemandOffer = (postId, payload) => api.post(`/demand-posts/${postId}/offers/`, payload)
