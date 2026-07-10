import api from './axios'

export const createFeedback = (data: {
  name: string
  email: string
  category:
    | 'Bug Report'
    | 'Feature Request'
    | 'Improvement'
    | 'Question'
    | 'General Feedback'
  message: string
}) => api.post('/feedback', data)

export const getFeedback = () => api.get('/feedback')

export const updateFeedbackStatus = (
  id: string,
  status: 'pending' | 'resolved'
) =>
  api.put(`/feedback/${id}/status`, {
    status,
  })
