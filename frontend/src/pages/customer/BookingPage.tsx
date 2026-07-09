import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setSelectedBusiness,
  setSelectedService,
  setSelectedStaff,
  setSelectedDate,
  setSelectedTime,
  clearBooking,
} from '../../store/slices/bookingSlice'
import { getBusinessReviews } from '../../api/review.api'
import { getBusinessBySlug } from '../../api/business.api'
import { getServicesBySlug } from '../../api/service.api'
import { getStaffBySlug } from '../../api/staff.api'
import { getAvailableSlots, createBooking } from '../../api/booking.api'
import type { Business, Service, Staff } from '../../types/index'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CalendarCheck,
  Clock,
  Scissors,
  User,
  ChevronLeft,
  Loader2,
  Check,
  MapPin,
  Star,
} from 'lucide-react'

const STEPS = ['service', 'staff', 'datetime', 'confirm'] as const
type Step = (typeof STEPS)[number]

const BookingPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const booking = useAppSelector((state) => state.booking)

  const [step, setStep] = useState<Step>('service')
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])

  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [locationNotes, setLocationNotes] = useState('')
  const [selectedDateInput, setSelectedDateInput] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  useEffect(() => {
    const loadBusiness = async () => {
      if (!slug) return
      try {
        const [businessRes, servicesRes] = await Promise.all([
          getBusinessBySlug(slug),
          getServicesBySlug(slug),
        ])
        setBusiness(businessRes.data.business)
        dispatch(setSelectedBusiness(businessRes.data.business))
        setServices(servicesRes.data.services)
        getBusinessReviews(businessRes.data.business._id)
          .then((reviewsRes) => {
            setAverageRating(reviewsRes.data.averageRating)
            setTotalReviews(reviewsRes.data.totalReviews)
          })
          .catch(() => {})
      } catch {
        toast.error('Business not found')
      } finally {
        setIsLoading(false)
      }
    }
    void loadBusiness()
  }, [slug, dispatch])

  const handleSelectService = async (service: Service) => {
    dispatch(setSelectedService(service))
    try {
      const res = await getStaffBySlug(slug as string)
      setStaffList(res.data.staff)
      setStep('staff')
    } catch {
      toast.error('Failed to load staff')
    }
  }

  const handleSelectStaff = (staff: Staff) => {
    dispatch(setSelectedStaff(staff))
    setStep('datetime')
  }

  const handleDateChange = async (dateValue: string) => {
    setSelectedDateInput(dateValue)
    dispatch(setSelectedDate(dateValue))
    setSlots([])

    if (!booking.selectedStaff || !booking.selectedService) return

    setIsLoadingSlots(true)
    try {
      const res = await getAvailableSlots(
        booking.selectedStaff._id,
        booking.selectedService._id,
        dateValue
      )
      setSlots(res.data.slots)
    } catch {
      toast.error('Failed to load available times')
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleSelectTime = (time: string) => {
    dispatch(setSelectedTime(time))
    setStep('confirm')
  }

  const handleConfirmBooking = async () => {
    if (
      !booking.selectedBusiness ||
      !booking.selectedService ||
      !booking.selectedStaff ||
      !booking.selectedDate ||
      !booking.selectedTime
    ) {
      toast.error('Please complete all booking steps')
      return
    }

    if (!customerAddress.trim()) {
      toast.error('Please enter your address so staff can reach you')
      return
    }

    if (!customerPhone.trim()) {
      toast.error('Please enter a phone number so staff can contact you')
      return
    }

    setIsBooking(true)
    try {
      await createBooking({
        businessId: booking.selectedBusiness._id,
        staffId: booking.selectedStaff._id,
        serviceId: booking.selectedService._id,
        date: booking.selectedDate,
        startTime: booking.selectedTime,
        customerAddress,
        customerPhone,
        locationNotes,
      })
      toast.success('Booking confirmed!')
      dispatch(clearBooking())
      navigate('/home')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to create booking')
    } finally {
      setIsBooking(false)
    }
  }

  const goBack = () => {
    if (step === 'staff') setStep('service')
    else if (step === 'datetime') setStep('staff')
    else if (step === 'confirm') setStep('datetime')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Business not found
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            This booking link may be invalid or the business is no longer
            active.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to home
        </Link>
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <CalendarCheck size={22} />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {business.name}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">{business.description}</p>

          {totalReviews > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-xs mt-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={
                      i < Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200'
                    }
                  />
                ))}
              </div>
              <span className="font-medium text-zinc-700">{averageRating}</span>
              <span className="text-zinc-400">
                ({totalReviews} review{totalReviews === 1 ? '' : 's'})
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 mt-2">
            <MapPin size={13} />
            {business.address}, {business.city}
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full ${
                STEPS.indexOf(step) >= i ? 'bg-blue-600' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
          {step !== 'service' && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          {step === 'service' && (
            <div>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Choose a service
              </h2>
              {services.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">
                  No services available yet
                </p>
              ) : (
                <div className="space-y-2">
                  {services.map((service) => (
                    <button
                      key={service._id}
                      onClick={() => handleSelectService(service)}
                      className="w-full flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:border-blue-600 hover:bg-blue-50/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <Scissors size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {service.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {service.durationMins} mins
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-zinc-900">
                        {service.currency} {service.price.toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'staff' && (
            <div>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Choose a staff member
              </h2>
              {staffList.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">
                  No staff available
                </p>
              ) : (
                <div className="space-y-2">
                  {staffList.map((staff) => (
                    <button
                      key={staff._id}
                      onClick={() => handleSelectStaff(staff)}
                      className="w-full flex items-center gap-3 p-4 border border-zinc-200 rounded-lg hover:border-blue-600 hover:bg-blue-50/50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-zinc-900">
                        {staff.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {step === 'datetime' && (
            <div>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Choose date & time
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDateInput}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {selectedDateInput && (
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                    Available times
                  </label>
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2
                        size={20}
                        className="animate-spin text-blue-600"
                      />
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">
                      No available times on this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleSelectTime(time)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:border-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Clock size={13} />
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div>
              <h2 className="text-base font-semibold text-zinc-900 mb-4">
                Confirm your booking
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Service</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {booking.selectedService?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Staff</span>
                  <span className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
                    <User size={13} />
                    {booking.selectedStaff?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Date</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {booking.selectedDate &&
                      new Date(booking.selectedDate).toLocaleDateString(
                        'en-NG',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                  <span className="text-sm text-zinc-500">Time</span>
                  <span className="text-sm font-medium text-zinc-900">
                    {booking.selectedTime}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-500">Price</span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {booking.selectedService?.currency}{' '}
                    {booking.selectedService?.price.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Your address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="e.g. 15 Allen Avenue, Ikeja, Lagos"
                  rows={2}
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  Staff will come to this location
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="08012345678"
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <p className="text-xs text-zinc-400 mt-1">
                  In case staff need to reach you
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Additional notes (optional)
                </label>
                <textarea
                  value={locationNotes}
                  onChange={(e) => setLocationNotes(e.target.value)}
                  placeholder="e.g. Gate code, landmark, or special instructions"
                  rows={2}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>
              <button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Confirm booking
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingPage
