import api from './axios'

export const getStaff = () => api.get('/staff')
export const addStaff = (data: object) => api.post('/staff', data)
export const removeStaff = (id: string) => api.delete(`/staff/${id}`)
export const getStaffBookings = () => api.get('/bookings/staff/my')
export const getStaffBySlug = (slug: string) => api.get(`/staff/public/${slug}`)
export const markBookingComplete = (id: string) =>
  api.put(`/bookings/${id}/complete`)
