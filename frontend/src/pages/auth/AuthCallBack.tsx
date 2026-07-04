import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import api from '../../api/axios'

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const error = searchParams.get('error')
  const errorMessage = error ? decodeURIComponent(error) : null

  useEffect(() => {
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')

    if (error) {
      return
    }

    if (!token) {
      navigate('/login')
      return
    }

    const fetchUser = async () => {
      try {
        localStorage.setItem('token', token)

        if (userParam) {
          const user = JSON.parse(userParam)
          dispatch(setCredentials({ user, token }))

          if (user.mustChangePassword) {
            navigate('/change-password')
            return
          }

          const role = user.role
          if (role === 'business_owner') navigate('/business/dashboard')
          else if (role === 'staff') navigate('/staff/dashboard')
          else navigate('/home')
          return
        }

        const res = await api.get('/auth/me')
        dispatch(setCredentials({ user: res.data.user, token }))

        if (res.data.user.mustChangePassword) {
          navigate('/change-password')
          return
        }
        const role = res.data.user.role
        if (role === 'business_owner') navigate('/business/dashboard')
        else if (role === 'staff') navigate('/staff/dashboard')
        else navigate('/home')
      } catch {
        navigate('/login')
      }
    }

    fetchUser()
  }, [dispatch, error, navigate, searchParams])

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      {errorMessage ? (
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Google sign-in failed
          </h2>
          <p className="mt-2 text-sm text-zinc-600">{errorMessage}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Signing you in...</span>
        </div>
      )}
    </div>
  )
}

export default AuthCallback
