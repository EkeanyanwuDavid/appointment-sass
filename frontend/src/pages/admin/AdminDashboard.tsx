import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getPlatformStats } from '../../api/admin.api'
import { toast } from 'sonner'
import {
  Building2,
  Users,
  CalendarDays,
  TrendingUp,
  UserCog,
  Briefcase,
} from 'lucide-react'

interface Stats {
  totalBusinesses: number
  totalCustomers: number
  totalStaff: number
  totalOwners: number
  totalBookings: number
  totalRevenue: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getPlatformStats()
        setStats(res.data.stats)
      } catch {
        toast.error('Failed to load platform stats')
      } finally {
        setIsLoading(false)
      }
    }
    void loadStats()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Platform overview
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            A secret view across all of Bkly
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Businesses</p>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats?.totalBusinesses}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Customers</p>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats?.totalCustomers}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Business owners</p>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Briefcase size={16} className="text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats?.totalOwners}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Staff</p>
              <div className="p-2 bg-indigo-50 rounded-lg">
                <UserCog size={16} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats?.totalStaff}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Total bookings</p>
              <div className="p-2 bg-green-50 rounded-lg">
                <CalendarDays size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats?.totalBookings}
            </p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Total revenue</p>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900">
              ₦{stats?.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
