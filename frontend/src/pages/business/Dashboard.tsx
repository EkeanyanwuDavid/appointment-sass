import BusinessLayout from '../../components/layout/BusinessLayout'
import { useAppSelector } from '../../store/hooks'

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-blue-600">Business overview</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Manage your services, staff, and appointments from one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Services</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Staff</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Bookings</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
          </div>
        </div>
      </div>
    </BusinessLayout>
  )
}

export default Dashboard
