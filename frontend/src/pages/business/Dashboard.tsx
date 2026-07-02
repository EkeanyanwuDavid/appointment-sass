import { useState } from 'react'
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logout, type User } from '../../store/slices/authSlice'
import {
  CalendarCheck,
  LayoutDashboard,
  Scissors,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  User as UserIcon,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/business/dashboard' },
  { label: 'Services', icon: Scissors, path: '/business/services' },
  { label: 'Staff', icon: Users, path: '/business/staff' },
  { label: 'Bookings', icon: CalendarDays, path: '/business/bookings' },
]

type SidebarProps = {
  location: Location
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  user: User | null
  handleLogout: () => void
}

const DefaultDashboardContent = () => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-blue-600">Business overview</p>
      <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
        Welcome back
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
)

const Sidebar = ({
  location,
  setSidebarOpen,
  user,
  handleLogout,
}: SidebarProps) => (
  <div className="flex flex-col h-full bg-zinc-900 text-white w-64 p-4">
    <div className="flex items-center gap-2 mb-8 px-2">
      <div className="bg-blue-600 text-white p-1.5 rounded-lg">
        <CalendarCheck size={18} />
      </div>
      <span className="text-lg font-bold tracking-tight">Bkly</span>
    </div>

    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        )
      })}
    </nav>

    <div className="border-t border-zinc-800 pt-4 mt-4">
      <div className="flex items-center gap-3 px-2 mb-3">
        {user?.avatar ? (
          <img src={user.avatar} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <UserIcon size={16} className="text-zinc-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {user?.name}
          </p>
          <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors w-full"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </div>
  </div>
)

const BusinessLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          location={location}
          setSidebarOpen={setSidebarOpen}
          user={user}
          handleLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              location={location}
              setSidebarOpen={setSidebarOpen}
              user={user}
              handleLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <CalendarCheck size={16} />
            </div>
            <span className="font-bold text-zinc-900">Bkly</span>
          </div>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-zinc-600" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children ?? <DefaultDashboardContent />}
        </main>
      </div>
    </div>
  )
}

export default BusinessLayout
