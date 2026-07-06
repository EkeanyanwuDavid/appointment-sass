import { useEffect, useState } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import { getMyBusiness, updateBusiness } from '../../api/business.api'
import type { Business } from '../../types/index'
import { toast } from 'sonner'
import { Loader2, Copy, Check } from 'lucide-react'

const Settings = () => {
  const [business, setBusiness] = useState<Business | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    category: '',
    imageUrl: '',
  })

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await getMyBusiness()
        const biz = res.data.business
        setBusiness(biz)
        setForm({
          name: biz.name,
          description: biz.description,
          phone: biz.phone,
          address: biz.address,
          city: biz.city,
          category: biz.category,
          imageUrl: biz.imgUrl || '',
        })
      } catch {
        toast.error('Failed to load business info')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBusiness()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateBusiness(form)
      toast.success('Business updated successfully')
    } catch {
      toast.error('Failed to update business')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/book/${business?.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </BusinessLayout>
    )
  }

  return (
    <BusinessLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Settings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage your business profile
          </p>
        </div>

        {/* Booking URL */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900 mb-1">
            Your booking page
          </h2>
          <p className="text-xs text-zinc-500 mb-3">
            Share this link with your customers
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-600 truncate">
              {window.location.origin}/book/{business?.slug}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Business info form */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-zinc-900 mb-4">
            Business information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Business name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Cover image URL
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Paste a link to an image (e.g. from Imgur, Google Drive, or your
                own hosting)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
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
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
            <div className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-medium text-red-600 mb-2">
                Danger zone
              </h2>

              <p className="text-xs text-zinc-500 mb-4">
                Permanently delete your workspace and all associated data.
              </p>

              <button className="bg-red-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors">
                Delete workspace
              </button>
            </div>
          </form>
        </div>
      </div>
    </BusinessLayout>
  )
}

export default Settings
