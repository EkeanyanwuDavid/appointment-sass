import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllBusinesses } from '../../api/business.api'
import type { Business } from '../../types/index'
import SupportSection from '../auth/SupportSection'
import FadeUp from '../../components/animations/Fadeup'
import ScrollToTopButton from '../../components/ui/ScrolltoTopBtn'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  Search,
  Clock,
  Sparkles,
  Scissors,
  Stethoscope,
  Scale,
  Briefcase,
  Camera,
  Dumbbell,
  UtensilsCrossed,
  Store,
  ArrowRight,
  MapPin,
  ChevronDown,
  PhoneCall,
  Mail,
  RocketIcon,
  MessageCircle,
} from 'lucide-react'

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

const categoryList = [
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'fitness', label: 'Fitness & Wellness' },
  { value: 'restaurant', label: 'Catering' },
  { value: 'photographer', label: 'Photography' },
]

const faqs = [
  {
    question: 'How do I become a customer?',
    answer:
      'Just click "Find a service" and create a free account. You can start browsing businesses and booking appointments right away.',
  },
  {
    question: 'Do I need to travel to the business?',
    answer:
      "No — that's the whole point of Bkly. A professional comes to your location at the time you book.",
  },
  {
    question: 'How do I pay for a booking?',
    answer:
      'You can pay securely online through Paystack right after your booking is confirmed, from your bookings page.',
  },
  {
    question: 'Can I cancel a booking?',
    answer:
      'Yes, you can cancel any pending or confirmed booking from your "My bookings" page before it takes place.',
  },
  {
    question: 'I run a business — how do I list it on Bkly?',
    answer:
      'Click "List your business," create an account as a business owner, and set up your profile, services, and staff in minutes.',
  },
  {
    question: 'How do I become a staff member?',
    answer:
      "Staff accounts are created by business owners, not self-registered. If you work for a business using Bkly, ask the owner to add you as staff — you'll get a temporary password to log in, then set your own password on first login.",
  },
]

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z" />
  </svg>
)
const LandingPage = () => {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const res = await getAllBusinesses()
        setBusinesses(res.data.businesses.slice(0, 3))
      } catch {
        // fail silently
      } finally {
        setLoadingBusinesses(false)
      }
    }
    void loadBusinesses()
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-blue-50/30 to-zinc-50">
      {/* Nav */}
      <div className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="bg-blue-600 text-white p-1.5 rounded-lg"
            >
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <CalendarCheck size={18} />
              </div>
            </motion.div>

            <span className="font-bold text-xl text-zinc-900">Bkly</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-base font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <FadeUp>
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="inline-flex items-center gap-1.5  bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={13} />
              No more waiting rooms
            </div>
            <h1
              className="text-5xl sm:text-5xl lg:text-6xl leading-[1.1] text-zinc-900  mx-auto tracking-[-0.01em]"
              style={{
                fontFamily: "'Google Sans Flex', sans-serif",
                fontWeight: 750,
              }}
            >
              <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Book
              </span>{' '}
              a professional who comes to you
            </h1>
            <p className="text-lg text-zinc-500 mt-5 max-w-2xl mx-auto leading-8">
              Bkly connects you with barbers, caterers, stylists, and more
              booked in minutes, delivered at your door.
            </p>
            <div className="flex flex-col  sm:flex-row items-center justify-center gap-3 mt-8">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-8 py-4 text-base font-medium hover:bg-blue-700 transition-colors"
                >
                  Find a service
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border border-zinc-200 bg-white text-zinc-700 rounded-lg px-8 py-4 text-base font-medium hover:bg-zinc-50 transition-colors"
                >
                  List your business
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Early Access */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <motion.div whileHover={{ y: -3 }}>
          {' '}
          <Link
            to="/register"
            className="block rounded-xl border border-blue-100 bg-blue-50 p-5 text-center hover:bg-blue-100/70 hover:border-blue-200 transition-colors group"
          >
            <h3 className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xl font-semibold text-blue-900">
              <RocketIcon className="w-5 h-5 shrink-0" />
              <span>
                Bkly is now welcoming its first customers and businesses.
              </span>
            </h3>

            <p className="mt-2 text-base text-blue-700">
              Be among the first to experience hassle-free home service bookings
              and help shape the future of Bkly.
            </p>

            <span className="inline-flex items-center gap-1.5 mt-2 text-base font-medium text-blue-700 group-hover:gap-2.5 transition-all">
              Join now
              <ArrowRight size={16} />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* How it works */}
      <FadeUp>
        {' '}
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl font-semibold text-zinc-900 text-center mb-8">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search size={20} className="text-blue-600" />
              </div>
              <p className="text-lg font-medium text-zinc-900">Browse</p>
              <p className="text-base text-zinc-500 mt-1">
                Find a business and service near you
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock size={20} className="text-blue-600" />
              </div>
              <p className="text-lg font-medium text-zinc-900">Pick a time</p>
              <p className="text-base text-zinc-500 mt-1">
                Choose a slot that works for your schedule
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <p className="text-lg font-medium text-zinc-900">
                Get served at your door
              </p>
              <p className="text-base text-zinc-500 mt-1">
                A professional comes to you, on time
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Live businesses */}
      <FadeUp delay={0.15}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-lg font-semibold text-zinc-900 text-center mb-8">
            Businesses already on Bkly
          </h2>

          {loadingBusinesses ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-zinc-200 bg-white overflow-hidden animate-pulse"
                >
                  <div className="h-20 bg-zinc-200" />

                  <div className="p-4 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-zinc-200" />
                    <div className="h-4 w-1/2 rounded bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : businesses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {businesses.map((business) => (
                <div
                  key={business._id}
                  className="bg-white border border-zinc-200 hover:-translate-y-1 hover:shadow-md transition-all rounded-xl overflow-hidden shadow-sm"
                >
                  {business.imageUrl ? (
                    <div className="h-20 bg-zinc-100">
                      <img
                        src={business.imageUrl}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`relative h-20 overflow-hidden bg-linear-to-br ${
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
                              size={72}
                              strokeWidth={1.25}
                              className="absolute -right-3 -bottom-4 text-white/15 -rotate-12"
                            />
                            <Icon
                              size={22}
                              strokeWidth={1.75}
                              className="absolute left-3.5 bottom-3.5 text-white"
                            />
                          </>
                        )
                      })()}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-lg font-medium text-zinc-900">
                      {business.name}
                    </p>
                    <p className="text-sm text-zinc-500 capitalize mt-0.5">
                      {business.category} • {business.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </FadeUp>

      {/* Categories */}
      <FadeUp delay={0.15}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl font-semibold text-zinc-900 text-center mb-8">
            Whatever you need, we've got you
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categoryList.map((cat) => {
              const Icon = categoryStyles[cat.value].icon
              return (
                <Link
                  key={cat.value}
                  to="/register"
                  className={`bg-linear-to-br ${categoryStyles[cat.value].gradient} rounded-xl p-5 text-white flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-md transition-all`}
                >
                  <Icon size={34} />
                  <p className="text-lg font-medium text-center">{cat.label}</p>
                </Link>
              )
            })}
          </div>
        </div>
      </FadeUp>

      {/* FAQ */}
      <FadeUp delay={0.2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-3xl font-semibold text-zinc-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left outline-none  focus-visible:ring-blue-600 focus-visible:ring-inset"
                >
                  <span className="text-lg font-medium text-zinc-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-zinc-400 transition-transform shrink-0 ml-3 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="text-base leading-7 text-zinc-500">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeUp>

      {/* Final CTA */}
      <FadeUp delay={0.25}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-4xl font-semibold text-zinc-900">
            Ready to get started?
          </h2>
          <p className="text-lg text-zinc-500 mt-2 mb-6">
            Join Bkly today — it takes less than a minute
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg text-base px-8 py-4 font-medium hover:bg-blue-700 transition-colors"
          >
            Create your account
            <ArrowRight size={16} />
          </Link>
        </div>
      </FadeUp>

      {/* Help */}
      <FadeUp delay={0.3}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={22} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900">Need help?</h2>
            <p className="text-lg text-zinc-500 mt-1 mb-5">
              Our team is here to guide you through booking or listing your
              business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:+2348012345678"
                className="flex items-center justify-center gap-1 border border-zinc-200 rounded-lg px-4 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <PhoneCall className="text-blue-600" size={16} />
                +234 814 790 1386
              </a>

              <a
                href="mailto:support@bkly.com"
                className="flex items-center justify-center gap-1 border border-zinc-200 rounded-lg px-4 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                <Mail className="text-blue-600" size={16} />
                support@bkly.com
              </a>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Support */}
      <FadeUp delay={0.35}>
        {' '}
        <SupportSection />
      </FadeUp>

      {/* Footer */}
      {/* Footer */}
      <FadeUp delay={0.35}>
        <footer className="bg-zinc-900 text-zinc-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <CalendarCheck size={18} />
                  </div>
                  <span className="font-bold text-xl text-white">Bkly</span>
                </div>
                <p className="text-base text-zinc-400 mt-4 max-w-sm leading-7">
                  Book barbers, caterers, stylists, and more — a professional
                  comes to you, on your schedule.
                </p>
                <div className="flex items-center gap-5 mt-5">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterIcon />
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </a>

                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </a>

                  <a
                    href="mailto:hello@bkly.com"
                    className="text-zinc-500 hover:text-white transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <p className="text-sm font-semibold text-white uppercase tracking-wide">
                  Product
                </p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <Link
                      to="/register"
                      className="text-base hover:text-white transition-colors"
                    >
                      Find a service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-base hover:text-white transition-colors"
                    >
                      List your business
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="text-base hover:text-white transition-colors"
                    >
                      Sign in
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <p className="text-sm font-semibold text-white uppercase tracking-wide">
                  Support
                </p>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a
                      href="tel:+2348147901386"
                      className="flex items-center gap-2 text-base hover:text-white transition-colors"
                    >
                      <PhoneCall size={15} />
                      +234 814 790 1386
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:support@bkly.com"
                      className="flex items-center gap-2 text-base hover:text-white transition-colors"
                    >
                      <Mail size={15} />
                      support@bkly.com
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/terms"
                      className="text-base hover:text-white transition-colors"
                    >
                      Terms & Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-sm text-zinc-500">
                &copy; {new Date().getFullYear()} Bkly. Book anything, anywhere.
              </p>
              <p className="text-sm text-zinc-500">
                Made in Port Harcourt, Nigeria
              </p>
            </div>
          </div>
        </footer>
      </FadeUp>
      <ScrollToTopButton />
    </div>
  )
}

export default LandingPage
