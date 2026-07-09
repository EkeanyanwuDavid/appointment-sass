import api from './axios'

export const getPlatformStats = () => api.get('/admin/stats')
export const getAllBusinessesAdmin = () => api.get('/admin/businesses')
export const toggleBusinessStatus = (id: string) =>
  api.put(`/admin/businesses/${id}/toggle`)
export const getAllUsersAdmin = (role?: string) =>
  api.get('/admin/users', { params: { role } })
