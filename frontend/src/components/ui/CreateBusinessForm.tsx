import { useState } from 'react'
import { createBusiness } from '../../api/business.api'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Props {
  onSuccess: () => void
}

const CreateBusinessForm = ({ onSuccess }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    phone: '',
    address: '',
    city: '',
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name'
        ? {
            slug: value
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
          }
        : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createBusiness(form)
      toast.success('Business created successfully!')
      onSuccess()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to create business')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1
          style={{
            fontFamily: "'Google Sans Flex', sans-serif",
            fontWeight: 700,
          }}
          className="text-2xl sm:text-3xl tracking-[-0.02em] text-zinc-900"
        >
          Set up your business
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Tell us about your business to get started
        </p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              Business name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. David's Barbershop"
              required
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              Booking page URL
            </label>
            <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
              <span className="px-3 py-3 text-base text-zinc-400 bg-zinc-50 border-r border-zinc-200">
                bkly.com/book/
              </span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="davids-barbershop"
                required
                className="flex-1 px-3 py-2.5 text-base focus:outline-none"
              />
            </div>
            <p className="text-m text-zinc-400 mt-1">
              Auto-generated from your business name. You can edit it.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="barbershop">Barbershop</option>
              <option value="salon">Salon</option>
              <option value="clinic">Clinic</option>
              <option value="lawyer">Legal Services</option>
              <option value="consultant">Consultant</option>
              <option value="photographer">Photography</option>
              <option value="fitness">Fitness & Wellness</option>
              <option value="restaurant">Restaurant & Catering</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell customers what you do..."
              rows={3}
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
              Phone number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="08012345678"
              required
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="15 Allen Avenue"
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Lagos"
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating business...
              </>
            ) : (
              'Create business'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateBusinessForm
