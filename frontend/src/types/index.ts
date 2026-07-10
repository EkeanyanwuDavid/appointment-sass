export interface Business {
  _id: string
  name: string
  slug: string
  category: string
  description: string
  phone: string
  address: string
  city: string
  imageUrl: string
  isActive: boolean
  ownerId: string
  createdAt: string
  averageRating?: number
  totalReviews?: number
  paystackSubaccountCode: string
  settlementBankCode: string
  settlementBankName: string
  accountNumber: string
  accountName: string
}

export interface Service {
  _id: string
  businessId: string
  name: string
  durationMins: number
  price: number
  currency: string
  isActive: boolean
}

export interface Staff {
  _id: string
  userId: string
  businessId: string
  name: string
  email: string
  phone: string
  isActive: boolean
}

export interface Booking {
  _id: string
  customerId: { _id: string; name: string; email: string; phone: string }
  businessId: { _id: string; name: string; slug: string }
  staffId: { _id: string; name: string }
  serviceId: {
    _id: string
    name: string
    price: number
    durationMins: number
    currency: string
  }
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  paymentRef: string
  createdAt: string
  customerAddress: string
  customerPhone: string
  locationNotes: string
}

export interface Leave {
  _id: string
  staffId: { _id: string; name: string; email: string }
  date: string
  reason: 'sick' | 'annual_leave' | 'personal'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Availability {
  _id: string
  staffId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isOff: boolean
}

export interface Review {
  _id: string
  bookingId: string
  customerId: { _id: string; name: string }
  businessId: string
  staffId: string
  serviceId: { _id: string; name: string }
  rating: number
  comment: string
  createdAt: string
}
