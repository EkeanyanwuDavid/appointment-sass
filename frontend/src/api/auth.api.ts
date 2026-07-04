import api from './axios'

export const changePassword = (newPassword: string) =>
  api.put('/auth/change-password', { newPassword })
