import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Car,
  CheckCircle2,
  Clock,
  Compass,
  LogOut,
  MapPin,
  RotateCcw,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { DriverAvatar } from './DriverAvatar';
import { StatusBadge } from './StatusBadge';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end: boolean;
  badge?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const {
    currentUser,
    currentDriverProfile,
    activeRole,
    rides,
    activePassenger,
    logout,
    toast,
    dismissToast,
    resetDemoData,
  } = useCampusRide();
  const navigate = useNavigate();

  const role = currentUser?.role || activeRole;

  const activePassengerRide = rides.find(
    (r) =>
      r.passengerId === activePassenger.id &&
      !['completed', 'cancelled'].includes(r.status)
  );

  const pendingRequestsCount = rides.filter((r) => r.status === 'requested').length;

  const passengerNav: NavItem[] = [
    { to: '/passenger', label: 'Book Ride', icon: Compass, end: true },
    { to: '/passenger/drivers', label: 'Drivers', icon: Car, end: false },
    {
      to: '/passenger/track',
      label: activePassengerRide ? 'Track Ride' : 'Ride Status',
      icon: MapPin,
      end: false,
      badge: activePassengerRide ? '1' : undefined,
    },
    { to: '/passenger/history', label: 'History', icon: Clock, end: false },
    { to: '/passenger/profile', label: 'Profile', icon: UserIcon, end: false },
  ];

  const driverNav: NavItem[] = [
    {
      to: '/driver',
      label: 'Driver Desk',
      icon: Car,
      end: true,
      badge:
        currentDriverProfile?.verificationStatus === 'verified' &&
        pendingRequestsCount > 0
          ? String(pendingRequestsCount)
          : undefined,
    },
    { to: '/driver/trips', label: 'Trip Log', icon: Clock, end: false },
    { to: '/driver/profile', label: 'Profile', icon: UserIcon, end: false },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin', label: 'Monitor Rides', icon: MapPin, end: true },
    { to: '/admin/drivers', label: 'Verify Drivers', icon: ShieldCheck, end: false },
    { to: '/admin/users', label: 'Users', icon: Users, end: false },
    { to: '/admin/profile', label: 'Profile', icon: UserIcon, end: false },
  ];

  const currentNav: NavItem[] =
    role === 'driver' ? driverNav : role === 'admin' ? adminNav : passengerNav;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#202938]">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#142B4A] rounded-md"
          >
            <span className="w-8 h-8 rounded-lg bg-[#142B4A] flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-[#FF8A34]" />
            </span>
            <span className="text-lg font-bold tracking-[-0.02em] text-[#142B4A]">
              CampusRide
            </span>
          </Link>

          {/* Tablet Horizontal Links (visible md..lg when sidebar is hidden) */}
          <nav
            aria-label="Tablet navigation"
            className="hidden md:flex lg:hidden items-center gap-5"
          >
            {currentNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative py-1 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#142B4A]'
                      : 'text-[#64748B] hover:text-[#142B4A]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF8A34] text-white tabular-nums leading-none">
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[#FF8A34] rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right User Context + Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2.5 text-xs">
                <div className="text-right">
                  <div className="font-bold text-[#142B4A] leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#64748B] capitalize">
                    {currentUser.role} ·{' '}
                    <span className="tabular-nums">
                      {currentUser.studentOrStaffId}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#142B4A] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 sm:top-20 right-4 left-4 sm:left-auto sm:max-w-md z-50">
          <div
            role="status"
            className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-campus-lg border text-sm font-medium ${
              toast.tone === 'error'
                ? 'bg-[#FFE4E6] border-[#FDA4AF] text-[#93000A]'
                : toast.tone === 'success'
                  ? 'bg-[#142B4A] border-[#1E3A5F] text-white'
                  : 'bg-white border-[#CBD5E1] text-[#202938]'
            }`}
          >
            <CheckCircle2
              className={`w-4 h-4 mt-0.5 shrink-0 ${
                toast.tone === 'error'
                  ? 'text-[#E11D48]'
                  : toast.tone === 'success'
                    ? 'text-[#FF8A34]'
                    : 'text-[#142B4A]'
              }`}
            />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Dismiss notification"
              className="p-0.5 opacity-75 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar + Main Content Shell */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 xl:w-68 shrink-0 flex-col justify-between border-r border-[#E2E8F0] bg-white px-4 py-6">
          <div className="space-y-6">
            {/* Signed-in Role Summary */}
            {currentUser && (
              <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2.5">
                <div className="flex items-center gap-3">
                  <DriverAvatar
                    name={currentUser.name}
                    avatarUrl={currentDriverProfile?.avatarUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#142B4A] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] capitalize truncate">
                      {currentUser.role} Portal
                    </div>
                  </div>
                </div>
                {currentUser.role === 'driver' && currentDriverProfile && (
                  <div>
                    <StatusBadge
                      variant={currentDriverProfile.verificationStatus}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Sidebar Links */}
            <nav aria-label="Workspace sidebar" className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.05em] text-[#64748B]">
                {role} Menu
              </div>
              {currentNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#142B4A] text-white'
                          : 'text-[#44474E] hover:bg-[#F2F4F6] hover:text-[#142B4A]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-[#FF8A34]' : 'text-[#64748B]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FF8A34] text-white tabular-nums leading-none">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-[#F1F5F9]">
            <div className="px-2 text-[11px] text-[#64748B] leading-relaxed">
              UCC Security Desk:{' '}
              <strong className="text-[#142B4A] tabular-nums">
                +233 33 213 2440
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                navigate('/', { replace: true });
              }}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#64748B] hover:text-[#142B4A] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="hidden md:block border-t border-[#E2E8F0] bg-white mt-auto">
            <div className="px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-[#142B4A]">
                  CampusRide UCC · Cape Coast, Ghana
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Local demonstration state (no live GPS or online card processing)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  navigate('/', { replace: true });
                }}
                className="lg:hidden inline-flex items-center gap-1.5 font-semibold text-[#142B4A] hover:text-[#FF8A34] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Tab Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] h-14 flex items-center justify-around px-1"
      >
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center min-w-[54px] h-12 rounded-lg text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-[#142B4A]' : 'text-[#64748B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-[#FF8A34]' : 'text-[#64748B]'}`}
                    />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-[#FF8A34] text-white text-[9px] font-bold tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="mt-0.5 truncate max-w-[64px]">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
