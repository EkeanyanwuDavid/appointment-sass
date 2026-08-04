import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking } from '../../api/booking.api'
import { getMyReviews, createReview } from '../../api/review.api'
import type { Booking, Review } from '../../types/index'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  Clock,
  X,
  ChevronLeft,
  Star,
  Search,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  CalendarRange,
} from 'lucide-react'
import { initializePayment } from '../../api/payment.api'

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const statusIcons = {
  pending: <CircleDashed size={13} />,
  confirmed: <CircleCheckBig size={13} />,
  cancelled: <CircleX size={13} />,
  completed: <CircleCheckBig size={13} />,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'upcoming' | 'past' | 'cancelled'
  >('all')

  const upcomingBookings = bookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'confirmed'
  )
  const pastBookings = bookings.filter(
    (booking) =>
      booking.status === 'completed' || booking.status === 'cancelled'
  )

  const filteredBookings = bookings.filter((booking) => {
    const searchText =
      `${booking.businessId?.name || ''} ${booking.serviceId?.name || ''} ${booking.staffId?.name || ''}`.toLowerCase()
    const matchesSearch = searchText.includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'upcoming') {
      return booking.status === 'pending' || booking.status === 'confirmed'
    }
    if (activeFilter === 'past') {
      return booking.status === 'completed'
    }
    if (activeFilter === 'cancelled') {
      return booking.status === 'cancelled'
    }
    return true
  })

  const filteredUpcoming = filteredBookings.filter(
    (booking) => booking.status === 'pending' || booking.status === 'confirmed'
  )
  const filteredPast = filteredBookings.filter(
    (booking) =>
      booking.status === 'completed' || booking.status === 'cancelled'
  )

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

  const renderBookingCard = (booking: Booking) => (
    <div
      key={booking._id}
      className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-lg font-semibold text-zinc-900">
              {booking.businessId?.name}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium capitalize ${statusColors[booking.status]}`}
            >
              {statusIcons[booking.status]}
              {booking.status}
            </span>
            {booking.paymentStatus === 'paid' && (
              <span className="text-sm px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
                Paid
              </span>
            )}
            {booking.paymentStatus === 'refunded' && (
              <span className="text-sm px-2 py-0.5 rounded-full font-medium bg-zinc-100 text-zinc-500">
                Refunded
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            {booking.serviceId?.name} • with {booking.staffId?.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <CalendarDays size={15} />
            {new Date(booking.date).toLocaleDateString('en-NG', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Clock size={15} />
            {booking.startTime} - {booking.endTime}
          </div>
          <p className="text-lg font-semibold text-zinc-900">
            {booking.serviceId?.currency}{' '}
            {booking.serviceId?.price?.toLocaleString()}
          </p>
        </div>

        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <div className="flex flex-col gap-2 items-end">
            {booking.paymentStatus === 'unpaid' &&
              (booking.status === 'pending' ||
                booking.status === 'confirmed') && (
                <button
                  onClick={() => handlePayNow(booking._id)}
                  disabled={payingId === booking._id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {payingId === booking._id ? 'Redirecting...' : 'Pay now'}
                </button>
              )}
            {(booking.status === 'pending' ||
              booking.status === 'confirmed') && (
              <button
                onClick={() => setConfirmCancelId(booking._id)}
                disabled={cancellingId === booking._id}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <X size={15} />
                {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="flex flex-col gap-1 items-end shrink-0">
            {reviewsByBooking[booking._id] ? (
              <div className="flex items-center gap-1 text-sm text-zinc-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
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
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                <Star size={13} />
                Rate this service
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-base text-zinc-500 ouline-none focus:outline-none hover:text-zinc-900 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to home
        </Link>
        <div>
          <h1
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 750,
            }}
            className=" text-4xl sm:text-5xl leading-[1.1] font-semibold tracking-[-0.01em] text-zinc-900"
          >
            My bookings
          </h1>
          <p className="text-lg text-zinc-500 mt-3">
            View and manage your appointments
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() =>
                    setActiveFilter(
                      filter.key as 'all' | 'upcoming' | 'past' | 'cancelled'
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    activeFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="relative md:min-w-[280px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search bookings"
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm text-zinc-700 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <CalendarDays size={42} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 text-lg font-semibold">
              No bookings yet
            </p>
            <p className="text-zinc-400 text-base mt-1">
              Your booking history will show up here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-zinc-500">Total bookings</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {bookings.length}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-zinc-500">Upcoming</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {upcomingBookings.length}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-zinc-500">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {
                    pastBookings.filter(
                      (booking) => booking.status === 'completed'
                    ).length
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarRange size={18} className="text-blue-600" />
              <h2 className="text-lg font-semibold text-zinc-900">
                {activeFilter === 'upcoming'
                  ? 'Upcoming appointments'
                  : activeFilter === 'past'
                    ? 'Past appointments'
                    : activeFilter === 'cancelled'
                      ? 'Cancelled appointments'
                      : 'All appointments'}
              </h2>
            </div>

            {filteredUpcoming.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-700">
                    Upcoming
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {filteredUpcoming.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {filteredUpcoming.map((booking) =>
                    renderBookingCard(booking)
                  )}
                </div>
              </div>
            )}

            {filteredPast.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-700">Past</h3>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    {filteredPast.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {filteredPast.map((booking) => renderBookingCard(booking))}
                </div>
              </div>
            )}

            {filteredBookings.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                No bookings match your search.
              </div>
            )}
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
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">
              Cancel this booking?
            </h2>
            <p className="text-base text-zinc-500 mb-7">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 border border-zinc-200 text-zinc-700 rounded-lg px-3 py-2.5 text-base font-medium hover:bg-zinc-50 transition-colors"
              >
                Keep booking
              </button>
              <button
                onClick={() => handleCancel(confirmCancelId)}
                className="flex-1 bg-red-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-600 transition-colors"
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
            <h2 className="text-xl font-semibold text-zinc-900 mb-1">
              Rate this service
            </h2>
            <p className="text-base text-zinc-500 mb-4">
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
                      size={32}
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
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition resize-none mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setReviewBookingId(null)}
                className="flex-1 border border-zinc-200 text-zinc-700 rounded-lg px-4 py-3 text-base font-medium hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
