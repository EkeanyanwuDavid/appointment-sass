import { useEffect, useState } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import {
  getStaff,
  addStaff,
  updateStaff,
  removeStaff,
} from '../../api/staff.api'
import { getAvailability, setAvailability } from '../../api/availability.api'
import type { Staff } from '../../types/index'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, X, Clock, Users, Pencil } from 'lucide-react'

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const defaultAvailability = DAYS.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  isOff: i === 0,
}))

const ManageStaff = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availability, setAvailabilityState] = useState(defaultAvailability)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const fetchStaff = async () => {
    try {
      const res = await getStaff()
      setStaff(res.data.staff)
    } catch {
      toast.error('Failed to load staff')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadStaff = async () => {
      await fetchStaff()
    }

    void loadStaff()
  }, [])

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addStaff(form)
      toast.success('Staff added successfully')
      setShowAddModal(false)
      setForm({ name: '', email: '', phone: '' })
      fetchStaff()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = (staffMember: Staff) => {
    setEditingStaffId(staffMember._id)
    setEditForm({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
    })
    setShowEditModal(true)
  }

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStaffId) return
    setIsSubmitting(true)
    try {
      await updateStaff(editingStaffId, editForm)
      toast.success('Staff details updated')
      setShowEditModal(false)
      fetchStaff()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to update staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveStaff = async (id: string) => {
    if (!confirm('Remove this staff member?')) return
    try {
      await removeStaff(id)
      toast.success('Staff removed')
      fetchStaff()
    } catch {
      toast.error('Failed to remove staff')
    }
  }

  const openAvailabilityModal = async (staffMember: Staff) => {
    setSelectedStaff(staffMember)
    try {
      const res = await getAvailability(staffMember._id)
      if (res.data.availability.length > 0) {
        setAvailabilityState(res.data.availability)
      } else {
        setAvailabilityState(defaultAvailability)
      }
    } catch {
      setAvailabilityState(defaultAvailability)
    }
    setShowAvailabilityModal(true)
  }

  const handleSaveAvailability = async () => {
    if (!selectedStaff) return
    setIsSubmitting(true)
    try {
      await setAvailability({ staffId: selectedStaff._id, availability })
      toast.success('Availability saved')
      setShowAvailabilityModal(false)
    } catch {
      toast.error('Failed to save availability')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              style={{
                fontFamily: "'Google Sans Flex', sans-serif",
                fontWeight: 750,
              }}
              className="text-3xl sm:text-4xl leading-[1.1] tracking-[-0.01em] text-zinc-900"
            >
              Staff
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your team members and their availability
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add staff
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 text-sm">No staff members yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-sm text-blue-600 font-medium hover:underline"
            >
              Add your first staff member
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member._id}
                className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handleRemoveStaff(member._id)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="font-semibold text-base text-zinc-900 ">
                  {member.name}
                </p>
                <p className="text-sm text-zinc-400 mt-0.5">{member.email}</p>
                <p className="text-sm text-zinc-400">{member.phone}</p>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => openAvailabilityModal(member)}
                    className="flex items-center gap-1.5 text-sm text-blue-600 font-base hover:underline"
                  >
                    <Clock size={13} />
                    Set availability
                  </button>
                  <button
                    onClick={() => openEditModal(member)}
                    className="flex items-center gap-1.5 text-sm text-zinc-500 font-base hover:underline"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">
                Add staff member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-zinc-900 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Kunle"
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block  text-base font-medium text-zinc-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="kunle@example.com"
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-zinc-900 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08012345678"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add staff member'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">
                Edit staff member
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-zinc-900 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-zinc-900 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-zinc-900 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAvailabilityModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">
                {selectedStaff?.name}'s availability
              </h2>
              <button
                onClick={() => setShowAvailabilityModal(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {availability.map((day, index) => (
                <div key={day.dayOfWeek} className="flex items-center gap-3">
                  <div className="w-24 text-base text-zinc-700 font-base">
                    {DAYS[day.dayOfWeek]}
                  </div>
                  <input
                    type="checkbox"
                    checked={!day.isOff}
                    onChange={(e) => {
                      const updated = [...availability]
                      updated[index] = {
                        ...updated[index],
                        isOff: !e.target.checked,
                      }
                      setAvailabilityState(updated)
                    }}
                    className="accent-blue-600"
                  />
                  {!day.isOff && (
                    <>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => {
                          const updated = [...availability]
                          updated[index] = {
                            ...updated[index],
                            startTime: e.target.value,
                          }
                          setAvailabilityState(updated)
                        }}
                        className="border border-zinc-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <span className="text-zinc-400 text-base">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => {
                          const updated = [...availability]
                          updated[index] = {
                            ...updated[index],
                            endTime: e.target.value,
                          }
                          setAvailabilityState(updated)
                        }}
                        className="border border-zinc-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </>
                  )}
                  {day.isOff && (
                    <span className="text-sm text-zinc-400">Day off</span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveAvailability}
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save availability'
              )}
            </button>
          </div>
        </div>
      )}
    </BusinessLayout>
  )
}

export default ManageStaff
