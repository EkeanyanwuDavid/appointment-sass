import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking } from '../../api/booking.api'
import { getMyReviews, createReview } from '../../api/review.api'
import type { Booking, Review } from '../../types/index'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, X, ChevronLeft, Star } from 'lucide-react'
import { initializePayment } from '../../api/payment.api'

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reviewsByBooking, setReviewsByBooking] = useState<
    Record<string, Review>
  >({})
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const fetchBookings = async () => {
    try {
      const [bookingsRes, reviewsRes] = await Promise.all([
        getMyBookings(),
        getMyReviews(),
      ])
      setBookings(bookingsRes.data.bookings)
      const map: Record<string, Review> = {}
      for (const review of reviewsRes.data.reviews as Review[]) {
        map[review.bookingId] = review
      }
      setReviewsByBooking(map)
    } catch {
      toast.error('Failed to load your bookings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadBookings = async () => {
      await fetchBookings()
    }
    void loadBookings()
  }, [])

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
      setConfirmCancelId(null)
    }
  }

  const [payingId, setPayingId] = useState<string | null>(null)

  const handlePayNow = async (id: string) => {
    setPayingId(id)
    try {
      const res = await initializePayment(id)
      window.location.assign(res.data.authorizationUrl)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to start payment')
      setPayingId(null)
    }
  }

  const openReviewModal = (id: string) => {
    setReviewBookingId(id)
    setReviewRating(0)
    setReviewComment('')
  }

  const handleSubmitReview = async () => {
    if (!reviewBookingId) return
    if (reviewRating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmittingReview(true)
    try {
      await createReview({
        bookingId: reviewBookingId,
        rating: reviewRating,
        comment: reviewComment,
      })
      toast.success('Thanks for your feedback!')
      setReviewBookingId(null)
      fetchBookings()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to home
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">My bookings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            View and manage your appointments
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <p className="text-zinc-400 text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900">
                        {booking.businessId?.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[booking.status]}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {booking.serviceId?.name} • with {booking.staffId?.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <CalendarDays size={13} />
                      {new Date(booking.date).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Clock size={13} />
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <p className="text-xs font-medium text-zinc-900">
                      {booking.serviceId?.currency}{' '}
                      {booking.serviceId?.price?.toLocaleString()}
                    </p>
                  </div>

                  {(booking.status === 'pending' ||
                    booking.status === 'confirmed') && (
                    <div className="flex flex-col gap-2 items-end">
                      {booking.paymentStatus === 'unpaid' &&
                        (booking.status === 'pending' ||
                          booking.status === 'confirmed') && (
                          <button
                            onClick={() => handlePayNow(booking._id)}
                            disabled={payingId === booking._id}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {payingId === booking._id
                              ? 'Redirecting...'
                              : 'Pay now'}
                          </button>
                        )}
                      {(booking.status === 'pending' ||
                        booking.status === 'confirmed') && (
                        <button
                          onClick={() => setConfirmCancelId(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <X size={13} />
                          {cancellingId === booking._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      )}
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {reviewsByBooking[booking._id] ? (
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              className={
                                i < reviewsByBooking[booking._id].rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-200'
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewModal(booking._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors"
                        >
                          <Star size={13} />
                          Rate this service
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmCancelId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-2">
              Cancel this booking?
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 border border-zinc-200 text-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Keep booking
              </button>
              <button
                onClick={() => handleCancel(confirmCancelId)}
                className="flex-1 bg-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setReviewBookingId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-1">
              Rate this service
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              How was your experience?
            </p>

            <div className="flex items-center gap-1.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setReviewRating(value)}
                    className="p-0.5"
                  >
                    <Star
                      size={26}
                      className={
                        value <= reviewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-200'
                      }
                    />
                  </button>
                )
              })}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us more (optional)"
              rows={3}
              maxLength={1000}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReviewBookingId(null)}
                className="flex-1 border border-zinc-200 text-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings
