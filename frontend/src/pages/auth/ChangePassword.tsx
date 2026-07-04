import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { changePassword } from '../../api/auth.api'
import { useAppSelector } from '../../store/hooks'
import { toast } from 'sonner'
import { Loader2, CalendarCheck } from 'lucide-react'

const ChangePassword = () => {
  const navigate = useNavigate()
  const { user } = useAppSelector((state) => state.auth)
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

    setIsSubmitting(true)
    try {
      await changePassword(form.newPassword)
      toast.success('Password updated')

      if (user?.role === 'staff') navigate('/staff/dashboard')
      else if (user?.role === 'business_owner') navigate('/business/dashboard')
      else navigate('/home')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update password')
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
          <h2 className="text-lg sm:text-xl font-semibold">
            Set a new password
          </h2>
          <p className="text-zinc-500 mt-1 text-sm">
            For security, please set your own password before continuing
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
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
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
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
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update password'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
