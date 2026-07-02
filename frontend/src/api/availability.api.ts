import api from './axios'

export const setAvailability = (data: object) => api.post('/availability', data)
export const getAvailability = (staffId: string) =>
  api.get(`/availability/${staffId}`)
