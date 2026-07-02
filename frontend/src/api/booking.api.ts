import api from './axios'

export const getBusinessBookings = (businessId: string) =>
  api.get(`/bookings/business/${businessId}`)
export const getMyBookings = () => api.get('/bookings/my')
export const createBooking = (data: object) => api.post('/bookings', data)
export const updateBookingStatus = (id: string, status: string) =>
  api.put(`/bookings/${id}/status`, { status })
export const cancelBooking = (id: string) => api.put(`/bookings/${id}/cancel`)
