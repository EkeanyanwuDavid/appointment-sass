import { useEffect, useState } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import { useNavigate } from 'react-router-dom'
import type { Booking } from '../../types/index'
import { getMyBusiness } from '../../api/business.api'
import { getBusinessBookings } from '../../api/booking.api'
import { getStaff } from '../../api/staff.api'
import { getServices } from '../../api/service.api'
import { getBusinessReviews } from '../../api/review.api'
import { useAppSelector } from '../../store/hooks'
import { CalendarDays, Users, Scissors, TrendingUp, Star } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [staffCount, setStaffCount] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasBusiness, setHasBusiness] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessRes = await getMyBusiness()
        const biz = businessRes.data.business
        setHasBusiness(true)

        const [bookingsRes, staffRes, servicesRes, reviewsRes] =
          await Promise.all([
            getBusinessBookings(biz._id),
            getStaff(),
            getServices(),
            getBusinessReviews(biz._id),
          ])

        setBookings(bookingsRes.data.bookings)
        setStaffCount(staffRes.data.staff.length)
        setServiceCount(servicesRes.data.services.length)
        setAverageRating(reviewsRes.data.averageRating)

        setTotalReviews(reviewsRes.data.totalReviews)
      } catch (err: unknown) {
        const error = err as { response?: { status?: number } }
        if (error.response?.status === 404) {
          setHasBusiness(false)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bookings: 0,
      }
    })

    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
        weekday: 'short',
      })
      const day = last7Days.find((d) => d.date === bookingDate)
      if (day) day.bookings++
    })

    return last7Days
  }

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.serviceId?.price || 0), 0)

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const recentBookings = bookings.slice(0, 5)

  if (!hasBusiness && !isLoading) {
    return (
      <BusinessLayout>
        <div className="mx-auto max-w-3xl py-16 px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-3">
              Create your business profile
            </h1>
            <p className="text-sm text-zinc-500 mb-6">
              Your account is signed in, but you still need to set up a business
              to manage services and bookings.
            </p>
            <button
              onClick={() => navigate('/business/setup')}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Set up business
            </button>
          </div>
        </div>
      </BusinessLayout>
    )
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 750,
            }}
            className="text-3xl sm:text-4xl leading-[1.1] tracking-[-0.01em] font-semibold text-zinc-900"
          >
            Hi{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here's what's happening today
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Total bookings</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDays size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {bookings.length}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {pendingBookings} pending
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Revenue</p>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              ₦{totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-400 mt-1">From paid bookings</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Staff</p>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">{staffCount}</p>
            <p className="text-xs text-zinc-400 mt-1">Active members</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Services</p>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Scissors size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {serviceCount}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Available services</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Rating</p>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Star size={16} className="text-amber-500 fill-amber-500" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {totalReviews > 0 ? averageRating : '—'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {totalReviews} review{totalReviews === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Chart + Recent bookings */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart */}
          <div
            className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none"
            style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
          >
            <h2 className="text-sm font-medium text-zinc-900 mb-4">
              Bookings this week
            </h2>
            <ResponsiveContainer
              width="100%"
              height={200}
              className="outline-none"
              style={{ outline: 'none' }}
            >
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#bookingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Recent bookings */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
            <h2 className="text-sm font-medium text-zinc-900 mb-4">
              Recent bookings
            </h2>
            {recentBookings.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-zinc-400">
                No bookings yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {booking.customerId?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {booking.serviceId?.name} •{' '}
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-50 text-green-700'
                          : booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : booking.status === 'completed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Recent reviews */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm outline-none">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-zinc-500">Rating</p>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Star size={16} className="text-amber-500 fill-amber-500" />
            </div>
          </div>

          <p className="text-2xl font-semibold text-zinc-900">
            {totalReviews > 0 ? averageRating : '—'}
          </p>

          <p className="text-xs text-zinc-400 mt-1">
            {totalReviews} review{totalReviews === 1 ? '' : 's'}
          </p>

          <button
            onClick={() => navigate('/business/ratings')}
            className="text-xs text-blue-600 hover:text-blue-700 mt-3 font-medium"
          >
            View ratings →
          </button>
        </div>
      </div>
    </BusinessLayout>
  )
}

export default Dashboard
