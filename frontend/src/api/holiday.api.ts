import api from './axios'

export const addHoliday = (data: object) => api.post('/holidays', data)
export const getHolidays = (businessId: string) =>
  api.get(`/holidays/business/${businessId}`)
export const deleteHoliday = (id: string) => api.delete(`/holidays/${id}`)
