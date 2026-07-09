import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getAllUsersAdmin } from '../../api/admin.api'
import { toast } from 'sonner'

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

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const res = await getAllUsersAdmin(
        roleFilter !== 'all' ? roleFilter : undefined
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Users</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {users.length} users found
          </p>
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
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                    Email
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                    Role
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
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
                    <td className="px-5 py-4 font-medium text-zinc-900">
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
