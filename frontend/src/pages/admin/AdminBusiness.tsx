import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import {
  getAllBusinessesAdmin,
  toggleBusinessStatus,
} from '../../api/admin.api'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'

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

  const fetchBusinesses = async () => {
    try {
      const res = await getAllBusinessesAdmin()
      setBusinesses(res.data.businesses)
    } catch {
      toast.error('Failed to load businesses')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      await fetchBusinesses()
    }
    void load()
  }, [])

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
          <h1 className="text-xl font-semibold text-zinc-900">Businesses</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {businesses.length} businesses on the platform
          </p>
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
                    Business
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                    Owner
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
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
                      <p className="font-medium text-zinc-900">
                        {business.name}
                      </p>
                      <p className="text-xs text-zinc-400">{business.city}</p>
                    </td>
                    <td className="px-5 py-4">
                      {business.ownerId ? (
                        <>
                          <p className="text-zinc-900">
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
                    <td className="px-5 py-4 text-zinc-500 capitalize">
                      {business.category}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          business.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {business.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
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
