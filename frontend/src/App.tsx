import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ChangePassword from './pages/auth/ChangePassword'
import Dashboard from './pages/business/Dashboard'
import AuthCallback from './pages/auth/AuthCallBack'
import Home from './pages/customer/Home'
import ManageServices from './pages/business/ManageService'
import ManageStaff from './pages/business/ManageStaff'
import ManageBookings from './pages/business/ManageBookings'
import CreateBusiness from './pages/business/CreateBusiness'
import Settings from './pages/business/Settings'

import BookingPage from './pages/customer/BookingPage'
import StaffDashboard from './pages/staff/StaffDashboard'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/business/dashboard" element={<Dashboard />} />
        <Route path="/business/services" element={<ManageServices />} />
        <Route path="/business/staff" element={<ManageStaff />} />
        <Route path="/business/bookings" element={<ManageBookings />} />
        <Route path="/business/setup" element={<CreateBusiness />} />
        <Route path="/business/settings" element={<Settings />} />

        {/* Staff */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />

        {/* Customer */}
        <Route path="/book/:slug" element={<BookingPage />} />

        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
