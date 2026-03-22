import { HashRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import AppShell from '../components/common/AppShell'
import ProtectedRoute from '../components/common/ProtectedRoute'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import AdminDashboard from '../pages/dashboard/AdminDashboard'
import ManagerDashboard from '../pages/dashboard/BuyerDashboard'
import DistributorDashboard from '../pages/dashboard/FarmerDashboard'
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
import SeasonPlannerPage from '../pages/distributor/SeasonPlannerPage'
import SmartRequestPage from '../pages/distributor/SmartRequestPage'
import PriorityQueuePage from '../pages/manager/PriorityQueuePage'
import ExceptionCenterPage from '../pages/manager/ExceptionCenterPage'
import DeliveryReliabilityPage from '../pages/manager/DeliveryReliabilityPage'
import WeeklySummaryPage from '../pages/admin/WeeklySummaryPage'
import CommitmentActualPage from '../pages/admin/CommitmentActualPage'
import { ROLES } from '../utils/constants'

function DashboardSwitch({ user }) {
  if (user?.role === ROLES.ADMIN) return <AdminDashboard />
  if (user?.role === ROLES.MANAGER) return <ManagerDashboard />
  return <DistributorDashboard />
}

function LegacyOrderDetailsRedirect() {
  const { id } = useParams()
  return <Navigate to={`/requests/${id}`} replace />
}

function AppLayout({ user, loading }) {
  return (
    <AppShell user={user}>
      <Routes>
        <Route path="/dashboard" element={<DashboardSwitch user={user} />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/supply/distributor" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><FarmerListingsPage /></ProtectedRoute>} />
        <Route path="/listings/new" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><ListingFormPage /></ProtectedRoute>} />
        <Route path="/requests/new" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><BuyerOrdersPage /></ProtectedRoute>} />
        <Route path="/requests/mine" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><BuyerOrdersPage /></ProtectedRoute>} />
        <Route path="/requests/queue" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><FarmerOrdersPage /></ProtectedRoute>} />
        <Route path="/requests/:id" element={<OrderDetailsPage />} />
        <Route path="/distribution/board" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><DispatchBoardPage /></ProtectedRoute>} />
        <Route path="/distribution/tracking" element={<ShipmentTrackingPage />} />
        <Route path="/distribution/planner" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><TripPlannerPage /></ProtectedRoute>} />
        <Route path="/distributor/season-planner" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><SeasonPlannerPage /></ProtectedRoute>} />
        <Route path="/distributor/smart-request" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.DISTRIBUTOR, ROLES.ADMIN]}><SmartRequestPage /></ProtectedRoute>} />
        <Route path="/manager/priority-queue" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><PriorityQueuePage /></ProtectedRoute>} />
        <Route path="/manager/exceptions" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><ExceptionCenterPage /></ProtectedRoute>} />
        <Route path="/manager/reliability" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.MANAGER, ROLES.ADMIN]}><DeliveryReliabilityPage /></ProtectedRoute>} />
        <Route path="/admin/weekly-summary" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.ADMIN]}><WeeklySummaryPage /></ProtectedRoute>} />
        <Route path="/admin/commitment-actual" element={<ProtectedRoute user={user} loading={loading} roles={[ROLES.ADMIN]}><CommitmentActualPage /></ProtectedRoute>} />
        <Route path="/demand-board" element={<DemandBoardPage user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/orders/buyer" element={<Navigate to="/requests/mine" replace />} />
        <Route path="/orders/farmer" element={<Navigate to="/requests/queue" replace />} />
        <Route path="/orders/:id" element={<LegacyOrderDetailsRedirect />} />
        <Route path="/logistics/dispatch-board" element={<Navigate to="/distribution/board" replace />} />
        <Route path="/logistics/trip-planner" element={<Navigate to="/distribution/planner" replace />} />
        <Route path="/logistics/shipment-tracking" element={<Navigate to="/distribution/tracking" replace />} />
        <Route path="/listings/farmer" element={<Navigate to="/supply/distributor" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}

function AppRouter({ user, loading }) {
  return (
    <HashRouter>
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
    </HashRouter>
  )
}

export default AppRouter
