import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import ProtectedRoute from '../components/common/ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import AdminDashboard from '../pages/dashboard/AdminDashboard'
import BuyerDashboard from '../pages/dashboard/BuyerDashboard'
import DispatcherDashboard from '../pages/dashboard/DispatcherDashboard'
import FarmerDashboard from '../pages/dashboard/FarmerDashboard'
import DemandBoardPage from '../pages/demand/DemandBoardPage'
import DispatchBoardPage from '../pages/logistics/DispatchBoardPage'
import ShipmentTrackingPage from '../pages/logistics/ShipmentTrackingPage'
import TripPlannerPage from '../pages/logistics/TripPlannerPage'
import FarmerListingsPage from '../pages/listings/FarmerListingsPage'
import ListingFormPage from '../pages/listings/ListingFormPage'
import MarketplacePage from '../pages/listings/MarketplacePage'
import BuyerOrdersPage from '../pages/orders/BuyerOrdersPage'
import FarmerOrdersPage from '../pages/orders/FarmerOrdersPage'
import OrderDetailsPage from '../pages/orders/OrderDetailsPage'
import ProfilePage from '../pages/profile/ProfilePage'
import { ROLES } from '../utils/constants'

function DashboardSwitch({ user }) {
  if (user?.role === ROLES.ADMIN) return <AdminDashboard />
  if (user?.role === ROLES.FARMER) return <FarmerDashboard />
  if (user?.role === ROLES.DISPATCHER) return <DispatcherDashboard />
  return <BuyerDashboard />
}

function AppLayout({ user, loading }) {
  return (
    <div className="layout">
      <Navbar user={user} />
      <div className="shell">
        <Sidebar user={user} />
        <main>
          <Routes>
            <Route path="/dashboard" element={<DashboardSwitch user={user} />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/listings/farmer" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.FARMER, ROLES.ADMIN]}><FarmerListingsPage /></ProtectedRoute>} />
            <Route path="/listings/new" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.FARMER, ROLES.ADMIN]}><ListingFormPage /></ProtectedRoute>} />
            <Route path="/orders/buyer" element={<BuyerOrdersPage />} />
            <Route path="/orders/farmer" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.FARMER, ROLES.ADMIN]}><FarmerOrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/logistics/dispatch-board" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISPATCHER, ROLES.ADMIN]}><DispatchBoardPage /></ProtectedRoute>} />
            <Route path="/logistics/trip-planner" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISPATCHER, ROLES.ADMIN]}><TripPlannerPage /></ProtectedRoute>} />
            <Route path="/logistics/shipment-tracking" element={<ShipmentTrackingPage />} />
            <Route path="/demand-board" element={<DemandBoardPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function AppRouter({ user, loading }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={loading ? null : (user ? <Navigate to="/dashboard" replace /> : <LoginPage />)} />
        <Route path="/register" element={loading ? null : (user ? <Navigate to="/dashboard" replace /> : <RegisterPage />)} />
        <Route
          path="/*"
          element={
            <ProtectedRoute user={user} loading={loading}>
              <AppLayout user={user} loading={loading} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
