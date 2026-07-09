import { useEffect, useState } from 'react'
import type { Review } from '../../types'
import BusinessLayout from '../../components/layout/BusinessLayout'
import { Star, MessageSquare, Users, AlertTriangle, Search } from 'lucide-react'
import { getMyBusiness } from '../../api/business.api'
import {
  getBusinessReviewStats,
  getBusinessReviews,
} from '../../api/review.api'

type StaffRating = {
  name: string
  averageRating: number
  totalReviews: number
}

const Ratings = () => {
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [distribution, setDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [topStaff, setTopStaff] = useState<StaffRating[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const businessRes = await getMyBusiness()
        const business = businessRes.data.business

        const [statsRes, reviewsRes] = await Promise.all([
          getBusinessReviewStats(business._id),
          getBusinessReviews(business._id),
        ])

        setAverageRating(statsRes.data.averageRating)
        setTotalReviews(statsRes.data.totalReviews)
        setDistribution(statsRes.data.distribution)
        setTopStaff(statsRes.data.topStaff)

        setReviews(reviewsRes.data.reviews)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRatings()
  }, [])

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
          <h1 className="text-xl font-semibold text-zinc-900">Ratings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            See how customers rate your business
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <p className="text-sm text-zinc-500">Average rating</p>
              <Star size={18} className="text-amber-500 fill-amber-500" />
            </div>

            <p className="text-2xl font-semibold">
              {totalReviews ? averageRating : '—'}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <p className="text-sm text-zinc-500">Reviews</p>
              <MessageSquare size={18} className="text-blue-600" />
            </div>

            <p className="text-2xl font-semibold">{totalReviews}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <p className="text-sm text-zinc-500">5 star reviews</p>
              <Star size={18} className="text-green-600 fill-green-600" />
            </div>

            <p className="text-2xl font-semibold">{distribution[5]}</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between mb-3">
              <p className="text-sm text-zinc-500">Needs attention</p>
              <AlertTriangle size={18} className="text-red-500" />
            </div>

            <p className="text-2xl font-semibold">
              {distribution[1] + distribution[2]}
            </p>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium mb-5">Rating distribution</h2>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center w-12">
                  <span>{star}</span>
                  <Star
                    size={14}
                    className="ml-1 fill-amber-400 text-amber-400"
                  />
                </div>

                <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: totalReviews
                        ? `${(distribution[star as keyof typeof distribution] / totalReviews) * 100}%`
                        : '0%',
                    }}
                  />
                </div>

                <span className="text-sm text-zinc-500">
                  {distribution[star as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top staff */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Users size={17} />
            <h2 className="text-sm font-medium">Top performing staff</h2>
          </div>

          {topStaff.length === 0 ? (
            <p className="text-sm text-zinc-400">No staff ratings yet</p>
          ) : (
            <div className="space-y-3">
              {topStaff.map((staff, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{staff.name}</p>
                    <p className="text-xs text-zinc-400">
                      {staff.totalReviews} reviews
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-sm">
                    {staff.averageRating}
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer reviews */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900 mb-5">
            Customer reviews
          </h2>

          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-zinc-400">
              <Search size={24} className="mb-2 text-zinc-300" />
              <p className="text-sm">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="py-4 border-b border-zinc-100 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900">
                      {review.customerId?.name || 'Customer'}
                    </p>

                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={13}
                          className={
                            index < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1">
                    {review.serviceId?.name} •{' '}
                    {new Date(review.createdAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>

                  {review.comment && (
                    <p className="text-sm text-zinc-600 mt-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  )
}

export default Ratings
