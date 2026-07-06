import api from './axios'

export const initializePayment = (bookingId: string) =>
  api.post('/payments/initialize', { bookingId })

export const verifyPayment = (reference: string) =>
  api.get(`/payments/verify/${reference}`)
