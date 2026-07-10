import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { resetPassword } from '../../api/auth.api'
import { toast } from 'sonner'
import { Loader2, CalendarCheck } from 'lucide-react'

const ResetPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword(token, form.newPassword)
      toast.success('Password reset — you can sign in now')
      navigate('/login')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <CalendarCheck size={22} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Bkly
            </h1>
          </div>
          <h2
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 750,
            }}
            className="text-3xl sm:text-4xl leading-[1.1] tracking-[-0.01em] text-zinc-900"
          >
            Reset your password
          </h2>
          <p className="text-zinc-500 mt-1 text-sm">
            Choose a new password for your account
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-base font-semibold text-zinc-900 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                placeholder="••••••••"
                required
                className="w-full border border-zinc-200 rounded-lg px-3 font-semibold py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
