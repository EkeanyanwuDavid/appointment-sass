import { useEffect, useState, useRef } from 'react'
import BusinessLayout from '../../components/layout/BusinessLayout'
import {
  getMyBusiness,
  updateBusiness,
  getBanks,
  createSubaccount,
} from '../../api/business.api'
import type { Business } from '../../types/index'
import { toast } from 'sonner'
import { Loader2, Copy, Check, Search } from 'lucide-react'

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

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([])
  const [selectedBank, setSelectedBank] = useState<{
    name: string
    code: string
  } | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const bankDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await getMyBusiness()
        const biz = res.data.business

        setBusiness(biz)

        const banksRes = await getBanks()
        setBanks(banksRes.data.banks)
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bankDropdownRef.current &&
        !bankDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBankDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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

  const handlePayoutSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBank || !accountNumber) {
      toast.error('Select bank and enter account number')
      return
    }

    const bank = selectedBank

    setIsConnecting(true)

    try {
      const res = await createSubaccount({
        settlementBankCode: bank.code,
        settlementBankName: bank.name,
        accountNumber,
      })

      setBusiness(res.data.business)

      toast.success('Payout account connected')
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } }
      }

      toast.error(
        error.response?.data?.message || 'Failed to connect payout account'
      )
    } finally {
      setIsConnecting(false)
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

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().startsWith(bankSearch.toLowerCase())
  )
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
            {/* Payout settings */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-medium text-zinc-900 mb-1">
                Payout settings
              </h2>

              <p className="text-xs text-zinc-500 mb-4">
                Connect your bank account to receive payments from bookings.
              </p>

              {business?.paystackSubaccountCode ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700">
                    Payout account connected
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Payments will automatically settle to your account.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePayoutSetup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Bank
                    </label>

                    <div ref={bankDropdownRef} className="space-y-2 relative">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                        />

                        <input
                          type="text"
                          value={bankSearch}
                          onChange={(e) => {
                            setBankSearch(e.target.value)
                            setSelectedBank(null)
                            setShowBankDropdown(true)
                          }}
                          onFocus={() => setShowBankDropdown(true)}
                          placeholder="Search bank..."
                          className="w-full border border-zinc-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>

                      {showBankDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredBanks.length > 0 ? (
                            filteredBanks.map((bank) => (
                              <button
                                key={bank.code}
                                type="button"
                                onClick={() => {
                                  setSelectedBank(bank)
                                  setBankSearch(bank.name)
                                  setShowBankDropdown(false)
                                }}
                                className="w-full text-left px-3 py-2.5 text-sm hover:bg-zinc-100"
                              >
                                {bank.name}
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-2.5 text-sm text-zinc-400">
                              No bank found
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Account number
                    </label>

                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0123456789"
                      maxLength={10}
                      className="w-full border border-zinc-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <button
                    disabled={isConnecting}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect payout account'}
                  </button>
                </form>
              )}
            </div>
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
