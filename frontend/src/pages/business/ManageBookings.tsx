import { useEffect, useState } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import { getMyBusiness } from '../../api/business.api'
import { getBusinessBookings, updateBookingStatus } from '../../api/booking.api'
import { getBusinessLeaves, updateLeaveStatus } from '../../api/leave.api'
import type { Booking, Leave } from '../../types/index'
import { toast } from 'sonner'
import { CalendarDays, Clock, User, Check, X as XIcon } from 'lucide-react'

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
}

const ManageBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'bookings' | 'leaves'>('bookings')
  const [filter, setFilter] = useState('all')

  const fetchData = async () => {
    try {
      const businessRes = await getMyBusiness()
      const biz = businessRes.data.business

      const [bookingsRes, leavesRes] = await Promise.all([
        getBusinessBookings(biz._id),
        getBusinessLeaves(biz._id),
      ])

      setBookings(bookingsRes.data.bookings)
      setLeaves(leavesRes.data.leaves)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadAvailable = async () => {
      await fetchData()
    }
    void loadAvailable()
  }, [])

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status)
      toast.success(`Booking ${status}`)
      fetchData()
    } catch {
      toast.error('Failed to update booking')
    }
  }

  const handleLeaveUpdate = async (id: string, status: string) => {
    try {
      await updateLeaveStatus(id, status)
      toast.success(`Leave ${status}`)
      fetchData()
    } catch {
      toast.error('Failed to update leave')
    }
  }

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Bookings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage appointments and staff leave requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bookings'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Bookings
            {bookings.filter((b) => b.status === 'pending').length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-center text-xs px-1.5 py-0.5 rounded-full">
                {bookings.filter((b) => b.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'leaves'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            Leave requests
            {leaves.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">
                {leaves.length}
              </span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'bookings' ? (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                      filter === s
                        ? 'bg-zinc-900 text-white'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {s}
                  </button>
                )
              )}
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
                <p className="text-zinc-400 text-sm">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-zinc-400" />
                          <p className="text-sm font-medium text-zinc-900">
                            {booking.customerId?.name || 'Customer'}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </div>
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
                        <p className="text-xs text-zinc-500">
                          {booking.serviceId?.name} • {booking.staffId?.name}
                        </p>
                        <p className="text-xs font-medium text-zinc-900">
                          ₦{booking.serviceId?.price?.toLocaleString()}
                        </p>
                        {booking.locationNotes && (
                          <p className="text-xs text-zinc-500 italic mt-1">
                            Note: {booking.locationNotes}
                          </p>
                        )}
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, 'confirmed')
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                          >
                            <Check size={13} />
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, 'cancelled')
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                          >
                            <XIcon size={13} />
                            Cancel
                          </button>
                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking._id, 'completed')
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Check size={13} />
                          Mark complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
                <p className="text-zinc-400 text-sm">
                  No pending leave requests
                </p>
              </div>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {leave.staffId?.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(leave.date).toLocaleDateString('en-NG', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        Reason: {leave.reason.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLeaveUpdate(leave._id, 'approved')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        <Check size={13} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleLeaveUpdate(leave._id, 'rejected')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        <XIcon size={13} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </BusinessLayout>
  )
}

export default ManageBookings
