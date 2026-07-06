import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStaffBookings, markBookingComplete } from '../../api/staff.api'
import { requestLeave, getMyLeaves } from '../../api/leave.api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import type { Booking, Leave } from '../../types/index'
import { toast } from 'sonner'
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  LogOut,
  Plus,
  User,
  X,
  Loader2,
} from 'lucide-react'

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const leaveStatusColors = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const StaffDashboard = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [bookings, setBookings] = useState<Booking[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ date: '', reason: 'sick' })

  const fetchData = async () => {
    try {
      const [bookingsRes, leavesRes] = await Promise.all([
        getStaffBookings(),
        getMyLeaves(),
      ])
      setBookings(bookingsRes.data.bookings)
      setLeaves(leavesRes.data.leaves)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchData()
    }
    void loadDashboard()
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await requestLeave(leaveForm)
      toast.success('Leave requested')
      setShowLeaveModal(false)
      setLeaveForm({ date: '', reason: 'sick' })
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to request leave')
    } finally {
      setIsSubmitting(false)
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  )

  const handleMarkComplete = async (id: string) => {
    try {
      await markBookingComplete(id)
      toast.success('Booking marked as complete')
      fetchData()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update booking')
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
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CalendarCheck size={18} />
            </div>
            <span className="font-bold text-zinc-900">Bkly</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Hi{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Here's your schedule</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Upcoming bookings</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDays size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {upcomingBookings.length}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Leave requests</p>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {leaves.length}
            </p>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900 mb-4">
            Your bookings
          </h2>
          {bookings.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
              No bookings yet
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-start justify-between gap-4 py-3 border-b border-zinc-100 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={13} className="text-zinc-400" />
                      <p className="text-sm font-medium text-zinc-900">
                        {booking.customerId?.name || 'Customer'}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {booking.serviceId?.name} •{' '}
                      {new Date(booking.date).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleMarkComplete(booking._id)}
                        className="text-xs text-blue-600 font-medium hover:underline"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave requests */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-900">
              Your leave requests
            </h2>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:underline"
            >
              <Plus size={13} />
              Request leave
            </button>
          </div>
          {leaves.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
              No leave requests yet
            </div>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between gap-4 py-3 border-b border-zinc-100 last:border-0"
                >
                  <div>
                    <p className="text-sm text-zinc-900 capitalize">
                      {leave.reason.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(leave.date).toLocaleDateString('en-NG', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${leaveStatusColors[leave.status]}`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLeaveModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-900">
                Request leave
              </h2>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={leaveForm.date}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, date: e.target.value })
                  }
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Reason
                </label>
                <select
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="sick">Sick</option>
                  <option value="annual_leave">Annual leave</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit request'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDashboard
