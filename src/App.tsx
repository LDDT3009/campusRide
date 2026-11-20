import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CampusRideProvider, useCampusRide } from './context/CampusRideContext';
import { UserRole } from './types/campus';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PassengerExplorePage } from './pages/PassengerExplorePage';
import { PassengerDriversPage } from './pages/PassengerDriversPage';
import { PassengerTrackPage } from './pages/PassengerTrackPage';
import { PassengerHistoryPage } from './pages/PassengerHistoryPage';
import { PassengerRideDetailsPage } from './pages/PassengerRideDetailsPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { DriverTripsPage } from './pages/DriverTripsPage';
import { AdminMonitorPage } from './pages/AdminMonitorPage';
import { AdminDriversPage } from './pages/AdminDriversPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { ProfilePage } from './pages/ProfilePage';

const ROLE_HOME: Record<UserRole, string> = {
  passenger: '/passenger',
  driver: '/driver',
  admin: '/admin',
};

const RequireRole: React.FC<{
  allowedRole: UserRole;
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const { currentUser, logout } = useCampusRide();

  if (!currentUser) {
    return <Navigate to={`/auth?mode=login&role=${allowedRole}`} replace />;
  }

  if (currentUser.status === 'suspended') {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#FDA4AF] shadow-campus-md p-6 text-center space-y-4">
          <h1 className="text-lg font-bold text-[#93000A]">
            Account Suspended
          </h1>
          <p className="text-sm text-[#64748B]">
            Your CampusRide account ({currentUser.email}) has been suspended by an administrator.
          </p>
          <button
            type="button"
            onClick={logout}
            className="h-10 px-5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (currentUser.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export default function App() {
  return (
    <CampusRideProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Passenger Routes */}
          <Route
            path="/passenger"
            element={
              <RequireRole allowedRole="passenger">
                <PassengerExplorePage />
              </RequireRole>
            }
          />
          <Route
            path="/passenger/drivers"
            element={
              <RequireRole allowedRole="passenger">
                <PassengerDriversPage />
              </RequireRole>
            }
          />
          <Route
            path="/passenger/track"
            element={
              <RequireRole allowedRole="passenger">
                <PassengerTrackPage />
              </RequireRole>
            }
          />
          <Route
            path="/passenger/history"
            element={
              <RequireRole allowedRole="passenger">
                <PassengerHistoryPage />
              </RequireRole>
            }
          />
          <Route
            path="/passenger/history/:rideId"
            element={
              <RequireRole allowedRole="passenger">
                <PassengerRideDetailsPage />
              </RequireRole>
            }
          />
          <Route
            path="/passenger/profile"
            element={
              <RequireRole allowedRole="passenger">
                <ProfilePage />
              </RequireRole>
            }
          />

          {/* Driver Routes */}
          <Route
            path="/driver"
            element={
              <RequireRole allowedRole="driver">
                <DriverDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/driver/trips"
            element={
              <RequireRole allowedRole="driver">
                <DriverTripsPage />
              </RequireRole>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <RequireRole allowedRole="driver">
                <ProfilePage />
              </RequireRole>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RequireRole allowedRole="admin">
                <AdminMonitorPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <RequireRole allowedRole="admin">
                <AdminDriversPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireRole allowedRole="admin">
                <AdminUsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <RequireRole allowedRole="admin">
                <ProfilePage />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CampusRideProvider>
  );
}
