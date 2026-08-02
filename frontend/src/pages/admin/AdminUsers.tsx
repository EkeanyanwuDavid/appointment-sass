import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getAllUsersAdmin } from '../../api/admin.api'
import { toast } from 'sonner'
import { Search, Users, X } from 'lucide-react'

interface AdminUser {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
}

const roleColors: Record<string, string> = {
  customer: 'bg-purple-50 text-purple-700',
  business_owner: 'bg-amber-50 text-amber-700',
  staff: 'bg-indigo-50 text-indigo-700',
  admin: 'bg-red-50 text-red-700',
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchUsers = async (searchOverride?: string) => {
    const searchValue = searchOverride !== undefined ? searchOverride : search
    setIsLoading(true)
    try {
      const res = await getAllUsersAdmin(
        roleFilter !== 'all' ? roleFilter : undefined,
        searchValue || undefined
      )
      setUsers(res.data.users)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchUsers()
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter])

  // Live search — waits 400ms after the last keystroke before refetching,
  // so it doesn't fire a request on every single character typed.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleClearSearch = () => {
    setSearch('')
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1
            style={{
              fontFamily: "'Google Sans Flex', sans-serif",
              fontWeight: 750,
            }}
            className="text-3xl sm:text-4xl leading-tight tracking-tight text-zinc-900"
          >
            Users
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {users.length} users found
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-zinc-200 rounded-lg pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'customer', 'business_owner', 'staff', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                roleFilter === r
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <Users size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No users yet
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Once people sign up, they’ll show up here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Email
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Role
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold text-zinc-900">
                      {u.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${roleColors[u.role] || 'bg-zinc-100 text-zinc-500'}`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminUsers
