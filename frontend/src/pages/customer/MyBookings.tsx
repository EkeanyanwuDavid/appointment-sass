import { useEffect, useState } from 'react'
import { getMyBookings, cancelBooking } from '../../api/booking.api'
import type { Booking } from '../../types/index'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, X, ChevronLeft } from 'lucide-react'
import { initializePayment } from '../../api/payment.api'

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const fetchBookings = async () => {
    try {
      const res = await getMyBookings()
      setBookings(res.data.bookings)
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
    </div>
  )
}

export default MyBookings
