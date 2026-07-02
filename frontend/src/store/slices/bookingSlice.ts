import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Business {
  _id: string
  name: string
  slug: string
  category: string
  description: string
  phone: string
  address: string
  city: string
}

export interface Service {
  _id: string
  name: string
  durationMins: number
  price: number
  currency: string
}

export interface Staff {
  _id: string
  name: string
  email: string
}

export interface BookingState {
  selectedBusiness: Business | null
  selectedService: Service | null
  selectedStaff: Staff | null
  selectedDate: string | null
  selectedTime: string | null
}

const initialState: BookingState = {
  selectedBusiness: null,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setSelectedBusiness: (state, action: PayloadAction<Business>) => {
      state.selectedBusiness = action.payload
    },
    setSelectedService: (state, action: PayloadAction<Service>) => {
      state.selectedService = action.payload
    },
    setSelectedStaff: (state, action: PayloadAction<Staff>) => {
      state.selectedStaff = action.payload
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload
    },
    setSelectedTime: (state, action: PayloadAction<string>) => {
      state.selectedTime = action.payload
    },
    clearBooking: (state) => {
      state.selectedBusiness = null
      state.selectedService = null
      state.selectedStaff = null
      state.selectedDate = null
      state.selectedTime = null
    },
  },
})

export const {
  setSelectedBusiness,
  setSelectedService,
  setSelectedStaff,
  setSelectedDate,
  setSelectedTime,
  clearBooking,
} = bookingSlice.actions

export default bookingSlice.reducer
