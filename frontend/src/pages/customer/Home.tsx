import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAllBusinesses } from '../../api/business.api'
import { getMyBookings } from '../../api/booking.api'
import { getServicesBySlug } from '../../api/service.api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout } from '../../store/slices/authSlice'
import type { Business } from '../../types/index'
import { toast } from 'sonner'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Camera,
  Briefcase,
  Dumbbell,
  LogOut,
  MapPin,
  RocketIcon,
  Scale,
  Scissors,
  Search,
  Sparkles,
  Stethoscope,
  Store,
  Star,
  UtensilsCrossed,
  X,
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

type RecentBusiness = {
  slug: string
  name: string
  imageUrl?: string
  category: string
  city?: string
}

type BusinessPreview = {
  slug: string
  name: string
  imageUrl?: string
  category: string
  city?: string
}

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [activeBookingsCount, setActiveBookingsCount] = useState(0)
  const [servicesBySlug, setServicesBySlug] = useState<
    Record<string, Array<{ name: string; price: number }>>
  >({})
  const [recentBusinesses, setRecentBusinesses] = useState<RecentBusiness[]>(
    () => {
      if (typeof window === 'undefined') return []

      const stored = window.localStorage.getItem('recentlyViewedBusinesses')
      if (!stored) return []

      try {
        const parsed = JSON.parse(stored) as RecentBusiness[]
        return Array.isArray(parsed) ? parsed : []
      } catch {
        window.localStorage.removeItem('recentlyViewedBusinesses')
        return []
      }
    }
  )
  const [selectedGalleryBusiness, setSelectedGalleryBusiness] =
    useState<Business | null>(null)

  const fetchBusinesses = async (override?: {
    search?: string
    category?: string
  }) => {
    const nextSearch = override?.search ?? search
    const nextCategory = override?.category ?? category

    setIsLoading(true)
    try {
      const res = await getAllBusinesses({
        search: nextSearch || undefined,
        category: nextCategory !== 'all' ? nextCategory : undefined,
      })
      const businessList = res.data.businesses as Business[]
      setBusinesses(businessList)

      const serviceResults = await Promise.all(
        businessList.map(async (business) => {
          try {
            const serviceRes = await getServicesBySlug(business.slug)
            return [business.slug, serviceRes.data.services || []] as const
          } catch {
            return [business.slug, []] as const
          }
        })
      )

      const nextServicesBySlug = serviceResults.reduce(
        (acc, [slug, services]) => {
          acc[slug] = services
          return acc
        },
        {} as Record<string, Array<{ name: string; price: number }>>
      )
      setServicesBySlug(nextServicesBySlug)
    } catch {
      toast.error('Failed to load businesses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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
      await fetchBusinesses({ search, category })
    }
    void loadBusinesses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    void fetchBusinesses({ search, category })
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleBusinessSelect = (business: BusinessPreview) => {
    const nextEntry: RecentBusiness = {
      slug: business.slug,
      name: business.name,
      imageUrl: business.imageUrl,
      category: business.category,
      city: business.city,
    }

    setRecentBusinesses((prev) => {
      const filtered = prev.filter((item) => item.slug !== business.slug)
      const updated = [nextEntry, ...filtered].slice(0, 4)
      window.localStorage.setItem(
        'recentlyViewedBusinesses',
        JSON.stringify(updated)
      )
      return updated
    })
  }

  const resetFilters = () => {
    setSearch('')
    setCategory('all')
    setSortBy('recommended')
    void fetchBusinesses({ search: '', category: 'all' })
  }

  const priceLabel = (business: Business) => {
    const services = servicesBySlug[business.slug] || []
    const pricedServices = services.filter(
      (service) => typeof service.price === 'number'
    )

    if (pricedServices.length > 0) {
      const minPrice = Math.min(
        ...pricedServices.map((service) => service.price)
      )
      return `₦${Math.round(minPrice).toLocaleString()}+`
    }

    const rating = business.averageRating ?? 4.6
    const basePrice = rating >= 4.8 ? 6500 : rating >= 4.4 ? 5000 : 3500
    return `₦${basePrice.toLocaleString()}+`
  }

  const availabilityLabel = (business: Business) => {
    if (!business.isActive) return 'Account inactive'
    if (!business.imageUrl && !business.gallery?.length)
      return 'Needs owner action'
    return 'Booking available'
  }

  const trustMetrics = (business: Business) => {
    const rating = business.averageRating ?? 4.6
    const totalReviews = business.totalReviews ?? 48
    const bookings = Math.max(45, totalReviews * 4 + 30)

    return {
      rating,
      totalReviews,
      bookings,
    }
  }

  const serviceTags = (business: Business) => {
    const services = servicesBySlug[business.slug] || []

    if (services.length > 0) {
      return services.slice(0, 3).map((service) => service.name)
    }

    const fallbackTags = [
      business.category === 'barbershop' ? 'Hair service' : 'Service',
      business.category === 'salon' ? 'Beauty service' : 'Booked online',
      business.category === 'clinic' ? 'Care visit' : 'Flexible timing',
    ]

    return fallbackTags.filter(Boolean)
  }

  const featuredBusinesses = useMemo(() => {
    const sorted = [...businesses]

    sorted.sort((a, b) => {
      const aMetrics = trustMetrics(a)
      const bMetrics = trustMetrics(b)

      if (sortBy === 'best-rated') {
        return (
          bMetrics.rating - aMetrics.rating ||
          bMetrics.totalReviews - aMetrics.totalReviews
        )
      }

      if (sortBy === 'popular') {
        return bMetrics.bookings - aMetrics.bookings
      }

      return (
        bMetrics.rating - aMetrics.rating ||
        bMetrics.bookings - aMetrics.bookings
      )
    })

    return sorted
  }, [businesses, sortBy])

  const activeFilters = [
    search ? `Search: “${search}”` : null,
    category !== 'all'
      ? `Category: ${categories.find((item) => item.value === category)?.label}`
      : null,
    sortBy !== 'recommended'
      ? `Sort: ${sortBy === 'best-rated' ? 'Best rated' : 'Popular'}`
      : null,
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50/20 to-zinc-50">
      <style>{`
        @keyframes softFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-cyan-500 text-white p-1.5 rounded-lg">
              <CalendarCheck size={18} />
            </div>
            <span
              className="text-lg tracking-[-0.03em] text-zinc-900"
              style={{
                fontFamily: "'Google Sans Flex', sans-serif",
                fontWeight: 800,
              }}
            >
              Bkly
            </span>
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

        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Discover trusted businesses
              </p>
              <p className="text-sm text-zinc-600">
                Browse standout service providers, compare ratings, and book in
                a few clicks.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <button
                type="button"
                onClick={() => {
                  setSortBy('popular')
                  setCategory('all')
                  setSearch('')
                  void fetchBusinesses({ search: '', category: 'all' })
                }}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  sortBy === 'popular'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Fast booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy('best-rated')
                  setCategory('all')
                  setSearch('')
                  void fetchBusinesses({ search: '', category: 'all' })
                }}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  sortBy === 'best-rated'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-zinc-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
              >
                Top rated
              </button>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/80">
            <div className="h-2 w-3/4 rounded-full bg-linear-to-r from-blue-600 to-cyan-500 transition-all" />
          </div>
          <p className="mt-2 text-sm text-zinc-600">
            3 simple steps: choose • confirm • arrive
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
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
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-3.5 text-sm font-medium text-zinc-600 focus:border-blue-600 focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="best-rated">Best rated</option>
              <option value="popular">Popular</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
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

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            {activeFilters.length > 0 ? (
              <>
                {activeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                  >
                    {filter}
                  </span>
                ))}
              </>
            ) : (
              <span className="font-semibold text-zinc-900">
                Browse all businesses
              </span>
            )}
          </div>
          {(search || category !== 'all' || sortBy !== 'recommended') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              <X size={14} />
              Reset
            </button>
          )}
        </div>

        {recentBusinesses.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Recently viewed
                </p>
                <p className="text-sm text-zinc-500">
                  Pick up where you left off
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Book again
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recentBusinesses.map((business) => (
                <Link
                  key={business.slug}
                  to={`/book/${business.slug}`}
                  onClick={() => handleBusinessSelect(business)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 p-2 transition-colors hover:border-blue-600 hover:bg-blue-50/40"
                >
                  {business.imageUrl ? (
                    <img
                      src={business.imageUrl}
                      alt={business.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                      <Store size={18} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {business.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {business.city || business.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
        ) : featuredBusinesses.length === 0 ? (
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
            {featuredBusinesses.map((business) => {
              const metrics = trustMetrics(business)
              const previewImage =
                business.gallery?.[1] ||
                business.gallery?.[0] ||
                business.imageUrl
              const galleryImages =
                business.gallery?.slice(0, 3) ||
                (business.imageUrl ? [business.imageUrl] : [])
              const badge =
                metrics.rating >= 4.7
                  ? 'Top rated'
                  : metrics.bookings > 120
                    ? 'Popular'
                    : null
              const badgeTone =
                badge === 'Top rated'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'

              return (
                <div
                  key={business._id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-36 overflow-hidden bg-zinc-100">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={business.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`relative h-full overflow-hidden bg-linear-to-br ${categoryStyles[business.category]?.gradient || categoryStyles.other.gradient}`}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
                      {badge && (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeTone}`}
                        >
                          {badge}
                        </span>
                      )}
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-700">
                        {availabilityLabel(business)}
                      </span>
                    </div>
                    {galleryImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSelectedGalleryBusiness(business)}
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm transition hover:bg-white"
                      >
                        <Camera size={15} />
                      </button>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-zinc-900">
                          {business.name}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
                          <MapPin size={14} />
                          <span>{business.city}</span>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                        {business.category}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400 transition-transform duration-300 group-hover:scale-110"
                        />
                        <span className="font-semibold text-zinc-800">
                          {metrics.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-zinc-400">•</span>
                      <span>{metrics.bookings} bookings</span>
                      <span className="text-zinc-400">•</span>
                      <span>Trusted provider</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-500 line-clamp-2">
                      {business.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {serviceTags(business)
                        .slice(0, 3)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {priceLabel(business)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          avg. service price
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {galleryImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSelectedGalleryBusiness(business)}
                            className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 transition hover:border-blue-600 hover:text-blue-700"
                          >
                            <Camera size={12} />
                            Photos
                          </button>
                        )}
                        <Link
                          to={`/book/${business.slug}`}
                          onClick={() => handleBusinessSelect(business)}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Book now
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedGalleryBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl"
            style={{ animation: 'softFadeIn 180ms ease-out' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-900">
                  {selectedGalleryBusiness.name}
                </p>
                <p className="text-sm text-zinc-500">
                  Previewing a few photos from this business
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGalleryBusiness(null)}
                className="rounded-full border border-zinc-200 p-2 text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {(
                selectedGalleryBusiness.gallery?.slice(0, 4) || [
                  selectedGalleryBusiness.imageUrl,
                ]
              ).map((image, index) => (
                <img
                  key={`${selectedGalleryBusiness._id}-${index}`}
                  src={image}
                  alt={`${selectedGalleryBusiness.name} preview ${index + 1}`}
                  className="h-48 w-full rounded-xl object-cover"
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <BadgeCheck size={16} className="text-blue-600" />
                <span>
                  Trusted business preview with social proof and availability
                  cues
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate(`/book/${selectedGalleryBusiness.slug}`)
                }
                className="flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Open booking
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
