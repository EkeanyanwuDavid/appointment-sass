import api from './axios'

export const requestLeave = (data: object) => api.post('/leaves', data)
export const getMyLeaves = () => api.get('/leaves/my')
export const getLeaveBalance = () => api.get('/leaves/balance')
export const getBusinessLeaves = (businessId: string) =>
  api.get(`/leaves/business/${businessId}`)
export const getStaffLeaveBalances = (businessId: string) =>
  api.get(`/leaves/business/${businessId}/balances`)
export const updateLeaveStatus = (id: string, status: string) =>
  api.put(`/leaves/${id}/status`, { status })
