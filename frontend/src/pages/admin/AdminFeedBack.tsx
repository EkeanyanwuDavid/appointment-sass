import { useEffect, useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getFeedback, updateFeedbackStatus } from '../../api/feedback.api'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface Feedback {
  _id: string
  name: string
  email: string
  category: string
  message: string
  status: 'pending' | 'resolved'
  createdAt: string
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeedback = async () => {
    try {
      const res = await getFeedback()
      setFeedback(res.data.feedback)
    } catch {
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFeedback()

    return () => {}
  }, [])

  const resolve = async (id: string) => {
    try {
      await updateFeedbackStatus(id, 'resolved')
      toast.success('Marked as resolved')
      void loadFeedback()
    } catch {
      toast.error('Something went wrong')
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    )
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1
          style={{
            fontFamily: "'Google Sans Flex', sans-serif",
            fontWeight: 750,
          }}
          className="text-3xl"
        >
          Feedback
        </h1>

        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center">
              <MessageSquare
                className="mx-auto mb-4 h-12 w-12 text-zinc-400"
                strokeWidth={1.5}
              />

              <p className="text-zinc-500">No feedback submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {item.name}
                      </h3>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                        {item.category}
                      </span>
                    </div>

                    <p className="mt-1 break-all text-sm text-zinc-500">
                      {item.email}
                    </p>

                    <p className="whitespace-pre-wrap text-base font-semibold break-words text-zinc-700">
                      {item.message}
                    </p>

                    <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-zinc-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>

                      <button
                        disabled={item.status === 'resolved'}
                        onClick={() => void resolve(item._id)}
                        className={`w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium transition ${
                          item.status === 'resolved'
                            ? 'cursor-default bg-green-100 text-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {item.status === 'resolved'
                          ? 'Resolved'
                          : 'Mark resolved'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminFeedback
