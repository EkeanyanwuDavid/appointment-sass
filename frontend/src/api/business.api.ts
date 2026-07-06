import api from './axios'

export const getMyBusiness = () => api.get('/business/me')
export const createBusiness = (data: object) => api.post('/business', data)
export const updateBusiness = (data: object) => api.put('/business/me', data)
export const getBusinessBySlug = (slug: string) => api.get(`/business/${slug}`)
export const getAllBusinesses = (params?: {
  search?: string
  category?: string
}) => api.get('/business/public', { params })
