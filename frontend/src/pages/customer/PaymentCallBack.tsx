import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { verifyPayment } from '../../api/payment.api'
import { CalendarCheck, Check, X, Loader2 } from 'lucide-react'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>(
    'verifying'
  )

  useEffect(() => {
    const confirm = async () => {
      const reference = searchParams.get('reference')

      if (!reference) {
        setStatus('failed')
        return
      }

      try {
        await verifyPayment(reference)
        setStatus('success')
      } catch {
        setStatus('failed')
      }
    }

    void confirm()
  }, [searchParams])
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-xl">
            <CalendarCheck size={22} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Bkly
          </h1>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8 shadow-sm">
          {status === 'verifying' && (
            <>
              <Loader2
                size={32}
                className="animate-spin text-blue-600 mx-auto mb-4"
              />
              <h2 className="text-base font-semibold text-zinc-900">
                Confirming your payment...
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Please wait a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">
                Payment successful!
              </h2>
              <p className="text-lg text-zinc-500 mt-1 mb-6">
                Your booking has been paid for
              </p>
              <Link
                to="/my-bookings"
                className="inline-block bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-base hover:bg-blue-700 transition-colors"
              >
                View my bookings
              </Link>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X size={24} className="text-red-600" />
              </div>
              <h2 className="text-base font-semibold text-zinc-900">
                Payment verification failed
              </h2>
              <p className="text-sm text-zinc-500 mt-1 mb-6">
                Please try again or contact support
              </p>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-zinc-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Back to my bookings
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback
