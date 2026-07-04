import api from './axios'

export const getServices = () => api.get('/services')
export const addService = (data: object) => api.post('/services', data)
export const updateService = (id: string, data: object) =>
  api.put(`/services/${id}`, data)
export const deleteService = (id: string) => api.delete(`/services/${id}`)
export const getServicesBySlug = (slug: string) =>
  api.get(`/services/public/${slug}`)
export const toggleService = (id: string, isActive: boolean) =>
  api.put(`/services/${id}`, { isActive })
