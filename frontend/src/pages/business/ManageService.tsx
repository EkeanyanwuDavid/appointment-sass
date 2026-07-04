import { useEffect, useState } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import {
  getServices,
  addService,
  updateService,
  deleteService,
  toggleService,
} from '../../api/service.api'
import type { Service } from '../../types/index'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    durationMins: '',
    price: '',
    currency: 'NGN',
  })

  const fetchServices = async () => {
    try {
      const res = await getServices()
      setServices(res.data.services)
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Failed to load services'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadServices = async () => {
      await fetchServices()
    }

    void loadServices()
  }, [])

  const openAddModal = () => {
    setEditingService(null)
    setForm({ name: '', durationMins: '', price: '', currency: 'NGN' })
    setShowModal(true)
  }

  const openEditModal = (service: Service) => {
    setEditingService(service)
    setForm({
      name: service.name,
      durationMins: String(service.durationMins),
      price: String(service.price),
      currency: service.currency,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      name: form.name,
      durationMins: Number(form.durationMins),
      price: Number(form.price),
      currency: form.currency,
    }

    try {
      if (editingService) {
        await updateService(editingService._id, data)
        toast.success('Service updated')
      } else {
        await addService(data)
        toast.success('Service added')
      }
      setShowModal(false)
      fetchServices()
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Something went wrong'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    try {
      await deleteService(id)
      toast.success('Service deleted')
      fetchServices()
    } catch {
      toast.error('Failed to delete service')
    }
  }
  const handleToggle = async (service: Service) => {
    try {
      await toggleService(service._id, !service.isActive)
      toast.success(
        service.isActive ? 'Service deactivated' : 'Service activated'
      )
      fetchServices()
    } catch {
      toast.error('Failed to update service')
    }
  }
  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">Services</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Manage what your business offers
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add service
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <p className="text-zinc-400 text-sm">No services yet</p>
            <button
              onClick={openAddModal}
              className="mt-4 text-sm text-blue-600 font-medium hover:underline"
            >
              Add your first service
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 md:hidden">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-zinc-900">
                        {service.name}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">
                        {service.durationMins} mins • {service.currency}{' '}
                        {service.price.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        service.isActive
                          ? 'bg-green-50 text-green-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggle(service)}
                      className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                      aria-label={
                        service.isActive
                          ? 'Deactivate service'
                          : 'Activate service'
                      }
                    >
                      {service.isActive ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                      Service
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                      Duration
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                      Price
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-medium text-zinc-500">
                      Status
                    </th>
                    <th className="px-5 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service._id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                    >
                      <td className="px-5 py-4 font-medium text-zinc-900">
                        {service.name}
                      </td>
                      <td className="px-5 py-4 text-zinc-500">
                        {service.durationMins} mins
                      </td>
                      <td className="px-5 py-4 text-zinc-900">
                        {service.currency} {service.price.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            service.isActive
                              ? 'bg-green-50 text-green-700'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(service)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                            aria-label={
                              service.isActive
                                ? 'Deactivate service'
                                : 'Activate service'
                            }
                          >
                            {service.isActive ? (
                              <ToggleRight size={15} />
                            ) : (
                              <ToggleLeft size={15} />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(service._id)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-zinc-900">
                {editingService ? 'Edit service' : 'Add service'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Service name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter service name you offer"
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm({ ...form, durationMins: e.target.value })
                  }
                  placeholder="e.g. 30"
                  required
                  min="1"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Price
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.currency}
                    onChange={(e) =>
                      setForm({ ...form, currency: e.target.value })
                    }
                    className="border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="e.g. 2000"
                    required
                    min="0"
                    className="flex-1 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : editingService ? (
                  'Update service'
                ) : (
                  'Add service'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </BusinessLayout>
  )
}

export default ManageServices
