import api from './axios'

export const changePassword = (newPassword: string) =>
  api.put('/auth/change-password', { newPassword })

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email })

export const resetPassword = (token: string, newPassword: string) =>
  api.put(`/auth/reset-password/${token}`, { newPassword })
