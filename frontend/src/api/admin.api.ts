import api from './axios'

export const getPlatformStats = () => api.get('/admin/stats')
export const getAllBusinessesAdmin = (search?: string) =>
  api.get('/admin/businesses', { params: { search } })
export const toggleBusinessStatus = (id: string) =>
  api.put(`/admin/businesses/${id}/toggle`)
export const getAllUsersAdmin = (role?: string, search?: string) =>
  api.get('/admin/users', { params: { role, search } })
