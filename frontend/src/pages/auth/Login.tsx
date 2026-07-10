import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loginUser } from '../../store/slices/authSlice'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, CalendarCheck } from 'lucide-react'
import GoogleAuthButton from './GoogleAuthButton'

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await dispatch(loginUser(form))

    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!')
      const user = result.payload.user
      if (user.mustChangePassword) navigate('/change-password')
      else if (user.role === 'business_owner') navigate('/business/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
      else navigate('/home')
    } else {
      toast.error(result.payload as string)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <CalendarCheck size={22} />
            </div>

            <h1
              style={{
                fontFamily: "'Google Sans Flex', sans-serif",
                fontWeight: 750,
              }}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900"
            >
              Bkly
            </h1>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
            Welcome back
          </h2>
          <p className="text-zinc-500 mt-2 text-base">
            Sign in to your account
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-8 sm:p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-zinc-900 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full border border-zinc-200 rounded-lg px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-zinc-900 mb-1.5">
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
                  autoComplete="current-password"
                  className="w-full border border-zinc-200 rounded-lg px-4 py-3.5 text-base pr-10 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
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
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-base text-zinc-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 accent-blue-600 focus:outline-none focus:ring-blue-600 focus:ring-offset-2 cursor-pointer"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-base text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-lg py-3.5 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <div className="space-y-2 mb-4">
            <p className="text-sm text-zinc-500 mb-2">
              Continue with Google as:
            </p>
            <GoogleAuthButton role="customer" label="Customer" />
            <GoogleAuthButton role="business_owner" label="Business Owner" />
          </div>
        </div>

        <p className="text-center text-base text-zinc-500 mt-5">
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
