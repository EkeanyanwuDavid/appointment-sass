import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createFeedback } from '../../api/feedback.api'

interface Props {
  open: boolean
  onClose: () => void
  category:
    | 'Bug Report'
    | 'Feature Request'
    | 'Improvement'
    | 'Question'
    | 'General Feedback'
}

const FeedbackModal = ({ open, onClose, category }: Props) => {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.')
      return
    }

    try {
      setLoading(true)

      await createFeedback({
        ...form,
        category,
      })

      toast.success('Feedback sent successfully.')

      setForm({
        name: '',
        email: '',
        message: '',
      })

      onClose()
    } catch {
      toast.error('Failed to send feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-zinc-100 p-6">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {category}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              We'd love to hear from you.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-base font-medium text-zinc-900 mb-1.5">
              Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-base font-base text-zinc-900 mb-1.5">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-base font-base text-zinc-900 mb-1.5">
              Message
            </label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              'Send feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default FeedbackModal
