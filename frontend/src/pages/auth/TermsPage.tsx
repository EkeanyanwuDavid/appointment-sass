import { Link } from 'react-router-dom'
import { CalendarCheck, ChevronLeft } from 'lucide-react'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-base font-base text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to home
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <CalendarCheck size={18} />
          </div>
          <span className="font-bold text-lg text-zinc-900">Bkly</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-9">
          <div>
            <h1
              className="text-5xl  leading-[1.1] text-zinc-900  mx-auto tracking-[-0.01em]"
              style={{
                fontFamily: "'Google Sans Flex', sans-serif",
                fontWeight: 750,
              }}
            >
              Terms of Service & Privacy Policy
            </h1>
            <p className="text-sm text-zinc-400 mt-1.5">
              Last updated: July 2026
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              1. What Bkly does
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              Bkly connects customers with independent businesses that provide
              services at the customer's location. Bkly is a booking platform —
              the businesses listed are independently owned and responsible for
              the services they provide.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              2. Information we collect
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              To provide bookings, we collect your name, email, phone number,
              and the address you provide when booking a service, so the
              assigned professional can reach you. We do not sell your personal
              information to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              3. Payments
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              Payments are processed securely through Paystack. Bkly does not
              store your card details. Refunds for cancelled, paid bookings are
              processed back to your original payment method, subject to our
              cancellation policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              4. Bookings & cancellations
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              You may cancel a pending or confirmed booking from your bookings
              page. Cancellation policies and any applicable fees may vary and
              will be clearly stated at the time of booking.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              5. Account responsibilities
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              You are responsible for maintaining accurate contact and address
              information so that bookings can be fulfilled. Business owners are
              responsible for the accuracy of their listings and the conduct of
              their staff.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              6. Contact
            </h2>
            <p className="text-[15px] leading-7 text-zinc-600">
              Questions about these terms or your data can be sent to{' '}
              <a
                href="mailto:support@bkly.com"
                className="text-blue-600 hover:underline"
              >
                support@bkly.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default TermsPage
