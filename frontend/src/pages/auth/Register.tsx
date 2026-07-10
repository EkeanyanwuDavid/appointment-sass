import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { registerUser } from '../../store/slices/authSlice'
import { toast } from 'sonner'
import { Loader2, CalendarCheck, Eye, EyeOff } from 'lucide-react'
import GoogleAuthButton from './GoogleAuthButton'
const Register = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading } = useAppSelector((state) => state.auth)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.role) {
      toast.error("Please select whether you're a customer or business owner")
      return
    }
    const result = await dispatch(registerUser(form))

    if (registerUser.fulfilled.match(result)) {
      toast.success('Account created successfully!')
      const user = result.payload.user
      if (user.role === 'business_owner') navigate('/business/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/home')
    } else {
      toast.error(result.payload as string)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-8">
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
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Create an account
          </h2>
          <p className="text-zinc-500 mt-1 text-base">
            Get started with Bkly today
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-base font-medium text-zinc-900 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your Name"
                required
                className="w-full border border-zinc-200 rounded-lg px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

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
                required
                className="w-full border border-zinc-200 rounded-lg px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-zinc-900 mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="08012345678"
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
                  className="w-full border border-zinc-200 rounded-lg px-4 py-3.5 text-base pr-10 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center focus:outline-none text-zinc-500 hover:text-zinc-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-zinc-900 mb-1.5">
                I'm signing up as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'customer' })}
                  className={`border rounded-lg px-4 py-3.5 text-base font-medium font-medium transition-all ${
                    form.role === 'customer'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'business_owner' })}
                  className={`border rounded-lg px-4 py-3.5 text-base font-medium transition-all ${
                    form.role === 'business_owner'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  Business owner
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-3.5 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 mt-5 mb-5">
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-sm text-zinc-400">or</span>
            <div className="flex-1 h-px bg-zinc-200" />
          </div>

          <div className="space-y-5">
            <p className="text-sm text-zinc-500 mb-2">
              Continue with Google as:
            </p>
            <GoogleAuthButton role="customer" label="Customer" />
            <GoogleAuthButton role="business_owner" label="Business Owner" />
          </div>
        </div>

        <p className="text-center text-base text-zinc-500 mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-zinc-900 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-base text-zinc-400 text-center mt-3">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-zinc-600">
            Terms & Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
