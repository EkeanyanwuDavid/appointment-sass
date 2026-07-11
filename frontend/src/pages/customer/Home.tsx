import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllBusinesses } from '../../api/business.api'
import { getMyBookings } from '../../api/booking.api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import type { Business } from '../../types/index'
import { toast } from 'sonner'
import {
  CalendarCheck,
  Search,
  MapPin,
  LogOut,
  CalendarDays,
  Scissors,
  Sparkles,
  Stethoscope,
  Scale,
  Briefcase,
  Camera,
  Dumbbell,
  UtensilsCrossed,
  Store,
  Star,
  RocketIcon,
} from 'lucide-react'

const categories = [
  { value: 'all', label: 'All' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'lawyer', label: 'Legal Services' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'photographer', label: 'Photography' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'restaurant', label: 'Restaurant & Catering' },
  { value: 'other', label: 'Other' },
]

const categoryStyles: Record<
  string,
  { gradient: string; icon: typeof Scissors }
> = {
  barbershop: { gradient: 'from-blue-500 to-blue-700', icon: Scissors },
  salon: { gradient: 'from-pink-500 to-rose-600', icon: Sparkles },
  clinic: { gradient: 'from-emerald-500 to-teal-600', icon: Stethoscope },
  lawyer: { gradient: 'from-slate-600 to-slate-800', icon: Scale },
  consultant: { gradient: 'from-indigo-500 to-purple-600', icon: Briefcase },
  photographer: { gradient: 'from-amber-500 to-orange-600', icon: Camera },
  fitness: { gradient: 'from-lime-500 to-green-600', icon: Dumbbell },
  restaurant: { gradient: 'from-red-500 to-rose-600', icon: UtensilsCrossed },
  other: { gradient: 'from-zinc-500 to-zinc-700', icon: Store },
}
const Home = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [activeBookingsCount, setActiveBookingsCount] = useState(0)

  const fetchBusinesses = async () => {
    setIsLoading(true)
    try {
      const res = await getAllBusinesses({
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
      })
      setBusinesses(res.data.businesses)
    } catch {
      toast.error('Failed to load businesses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Badge count is non-critical — fail silently, don't block the page
    getMyBookings()
      .then((res) => {
        const activeCount = res.data.bookings.filter(
          (b: { status: string }) =>
            b.status === 'pending' || b.status === 'confirmed'
        ).length
        setActiveBookingsCount(activeCount)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const loadBusinesses = async () => {
      await fetchBusinesses()
    }
    void loadBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBusinesses()
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CalendarCheck size={18} />
            </div>
            <span className="font-bold text-xl text-zinc-900">Bkly</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/my-bookings"
              className="relative flex items-center gap-1.5 text-base font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <CalendarDays size={16} />
              My bookings
              {activeBookingsCount > 0 && (
                <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 bg-blue-600 text-white text-[10px] font-semibold rounded-full">
                  {activeBookingsCount}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 space-y-8">
        <div>
          <p className="flex items-center gap-2 text-lg font-medium text-blue-600 mb-1.5">
            Hi{user?.name ? `, ${user.name}` : ''}
            <RocketIcon
              size={18}
              className="rotate-12 shrink-0"
              strokeWidth={2.25}
            />
          </p>
          <h1
            className="text-5xl sm:text-5xl leading-tight tracking-[-0.02em] text-zinc-900"
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 780,
            }}
          >
            <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Book
            </span>{' '}
            your next
            <br />
            appointment
          </h1>
          <p className="text-lg leading-8 text-zinc-500 mt-4 max-w-xl">
            Search trusted businesses near you and book in minutes
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="w-full border border-zinc-200 rounded-lg py-3.5 pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.value
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:bg-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Business list */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-zinc-200 rounded w-2/5" />
                  <div className="h-5 bg-zinc-200 rounded-full w-16" />
                </div>
                <div className="h-3 bg-zinc-200 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-zinc-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <Search size={42} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 text-base font-medium">
              No businesses found
            </p>
            <p className="text-zinc-400 text-sm font-semibold mt-1">
              Try a different search or category
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {businesses.map((business) => (
              <Link
                key={business._id}
                to={`/book/${business.slug}`}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {business.imageUrl ? (
                  <div className="h-24 bg-zinc-100">
                    <img
                      src={business.imageUrl}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`relative h-24 overflow-hidden bg-linear-to-br ${
                      categoryStyles[business.category]?.gradient ||
                      categoryStyles.other.gradient
                    }`}
                  >
                    {(() => {
                      const Icon =
                        categoryStyles[business.category]?.icon ||
                        categoryStyles.other.icon
                      return (
                        <>
                          <Icon
                            size={88}
                            strokeWidth={1.25}
                            className="absolute -right-4 -bottom-5 text-white/15 -rotate-12"
                          />
                          <Icon
                            size={26}
                            strokeWidth={1.75}
                            className="absolute left-4 bottom-4 text-white"
                          />
                        </>
                      )
                    })()}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-lg font-semibold text-zinc-900">
                      {business.name}
                    </p>
                    <span className="text-sm px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 capitalize">
                      {business.category}
                    </span>
                  </div>
                  {business.totalReviews ? (
                    <div className="flex items-center gap-1 mb-2">
                      <Star
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="text-sm font-medium text-zinc-700">
                        {business.averageRating}
                      </span>
                      <span className="text-xs text-zinc-400">
                        ({business.totalReviews})
                      </span>
                    </div>
                  ) : null}
                  <p className="text-sm leading-6 text-zinc-500 mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <MapPin size={15} />
                    {business.city}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
