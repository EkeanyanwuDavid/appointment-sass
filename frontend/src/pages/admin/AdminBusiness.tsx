import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  getAllBusinessesAdmin,
  toggleBusinessStatus,
} from '../../api/admin.api'
import { toast } from 'sonner'
import { AlertTriangle, Search, Users, X } from 'lucide-react'

interface AdminBusiness {
  _id: string
  name: string
  slug: string
  category: string
  city: string
  isActive: boolean
  ownerId: { name: string; email: string } | null
  createdAt: string
}

const AdminBusinesses = () => {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchBusinesses = async (searchOverride?: string) => {
    const searchValue = searchOverride !== undefined ? searchOverride : search
    setIsLoading(true)
    try {
      const res = await getAllBusinessesAdmin(searchValue || undefined)
      setBusinesses(res.data.businesses)
    } catch {
      toast.error('Failed to load businesses')
    } finally {
      setIsLoading(false)
    }
  }

  // Live search — waits 400ms after the last keystroke before refetching,
  // so it doesn't fire a request on every single character typed.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBusinesses()
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleClearSearch = () => {
    setSearch('')
  }

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    try {
      await toggleBusinessStatus(id)
      toast.success('Business status updated')
      fetchBusinesses()
    } catch {
      toast.error('Failed to update business')
    } finally {
      setTogglingId(null)
    }
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
            Businesses
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {businesses.length} businesses on the platform
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
            placeholder="Search by business name or city..."
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

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <Users size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No businesses yet
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Once businesses join the platform, they’ll appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Business
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Owner
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-wide uppercase text-zinc-500">
                    Status
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <tr
                    key={business._id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-base text-base text-zinc-900">
                        {business.name}
                      </p>
                      <p className="text-xs text-zinc-400">{business.city}</p>
                    </td>
                    <td className="px-5 py-4">
                      {business.ownerId ? (
                        <>
                          <p className="text-zinc-900 font-semibold text-base">
                            {business.ownerId.name}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {business.ownerId.email}
                          </p>
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 text-xs font-medium">
                          <AlertTriangle size={13} />
                          No owner found
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-base capitalize">
                      {business.category}
                    </td>
                    <td className="px-5 py-4 text-base">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          business.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {business.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-base">
                      <button
                        onClick={() => handleToggle(business._id)}
                        disabled={togglingId === business._id}
                        className={`text-xs font-medium hover:underline disabled:opacity-50 ${
                          business.isActive ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {business.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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

export default AdminBusinesses
