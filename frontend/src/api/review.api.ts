import api from './axios'

export const createReview = (data: {
  bookingId: string
  rating: number
  comment?: string
}) => api.post('/reviews', data)

export const getMyReviews = () => api.get('/reviews/my')

export const getBusinessReviews = (businessId: string) =>
  api.get(`/reviews/business/${businessId}`)

export const getRecentBusinessReviews = (businessId: string) =>
  api.get(`/reviews/business/${businessId}/recent`)

export const getBusinessReviewStats = (businessId: string) =>
  api.get(`/reviews/business/${businessId}/stats`)

export const getStaffReviews = (staffId: string) =>
  api.get(`/reviews/staff/${staffId}`)

export const getMyStaffReviews = () => api.get('/reviews/staff/my')
