import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginUser } from '../../store/slices/authSlice'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CalendarCheck } from 'lucide-react'

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [googleRole, setGoogleRole] = useState<
    'customer' | 'business_owner' | 'staff' | ''
  >('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(loginUser(form))

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      const user = result.payload.user
      if (user.role === 'business_owner') navigate('/business/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/')
    } else {
      toast.error(result.payload as string)
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

          <h2 className="text-lg sm:text-xl font-semibold">Welcome back</h2>
          <p className="text-zinc-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 focus:outline-none hover:text-zinc-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          <div className="flex items-center gap-3 mt-5 mb-5">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-xs text-zinc-400">or</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-medium text-zinc-900">
              Continue as
            </label>
            <select
              value={googleRole}
              onChange={(e) =>
                setGoogleRole(
                  e.target.value as 'customer' | 'business_owner' | 'staff' | ''
                )
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select your role</option>
              <option value="customer">Customer</option>
              <option value="business_owner">Business owner</option>
              <option value="staff">Staff member</option>
            </select>
            <p className="mt-2 text-xs text-zinc-500">
              Choose your role before continuing with Google.
            </p>
          </div>

          <button
            onClick={() => {
              if (!googleRole) {
                toast.error(
                  'Please select your role before continuing with Google.'
                )
                return
              }

              const url = new URL(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
              )
              url.searchParams.set('role', googleRole)
              window.location.href = url.toString()
            }}
            disabled={!googleRole}
            className="w-full flex items-center justify-center gap-3 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors mb-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-zinc-900 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
