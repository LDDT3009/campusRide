import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import {
  HERO_TAXI_IMAGE,
  UCC_LOCATIONS,
  calculateEstimatedFare,
  formatGhs,
} from '../data/uccData';
import { CampusMapSchematic } from '../components/CampusMapSchematic';

export const LandingPage: React.FC = () => {
  const { currentUser, drivers } = useCampusRide();
  const navigate = useNavigate();

  const [previewPickup, setPreviewPickup] = useState('valco');
  const [previewDropoff, setPreviewDropoff] = useState('library');

  const previewEstimate = useMemo(
    () => calculateEstimatedFare(previewPickup, previewDropoff, 'shared', 1),
    [previewPickup, previewDropoff]
  );

  const verifiedCount = drivers.filter(
    (d) => d.verificationStatus === 'verified'
  ).length;

  const dashboardRoute =
    currentUser?.role === 'driver'
      ? '/driver'
      : currentUser?.role === 'admin'
        ? '/admin'
        : '/passenger';

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8] text-[#202938]">
      {/* Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-[#142B4A] flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-[#FF8A34]" />
            </span>
            <span className="text-lg font-bold tracking-[-0.02em] text-[#142B4A]">
              CampusRide
            </span>
          </Link>

          <nav
            aria-label="Landing navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#64748B]"
          >
            <a
              href="#how-it-works"
              className="hover:text-[#142B4A] transition-colors whitespace-nowrap"
            >
              How It Works
            </a>
            <a
              href="#explore-zones"
              className="hover:text-[#142B4A] transition-colors whitespace-nowrap"
            >
              Campus Zones
            </a>
            <a
              href="#benefits"
              className="hover:text-[#142B4A] transition-colors whitespace-nowrap"
            >
              Benefits
            </a>
            <a
              href="#portals"
              className="hover:text-[#142B4A] transition-colors whitespace-nowrap"
            >
              Role Portals
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <Link
                to={dashboardRoute}
                className="h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>Open {currentUser.role} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth?mode=login&role=passenger"
                  className="h-10 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#142B4A] text-xs sm:text-sm font-semibold inline-flex items-center whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=register&role=passenger"
                  className="h-10 px-4 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-xs sm:text-sm font-semibold inline-flex items-center whitespace-nowrap"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10 lg:pt-12 lg:pb-14">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
                  University of Cape Coast · Campus Taxi Network
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.025em] text-[#142B4A] leading-[1.15]">
                  Reliable campus rides across Old Site, New Site & Student Hostels
                </h1>
                <p className="text-base text-[#64748B] leading-relaxed max-w-xl">
                  CampusRide connects UCC students with union-verified drivers for predictable GH₵ point-to-point trips between halls, lecture theatres, Sam Jonah Library, and surrounding Cape Coast hostels.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        currentUser
                          ? dashboardRoute
                          : '/auth?mode=register&role=passenger'
                      )
                    }
                    className="h-12 px-6 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold inline-flex items-center gap-2 shadow-campus-sm transition-colors cursor-pointer"
                  >
                    <span>
                      {currentUser ? 'Go to Book a Ride' : 'Book a Ride / Get Started'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <a
                    href="#explore-zones"
                    className="h-12 px-5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#142B4A] text-sm font-semibold inline-flex items-center"
                  >
                    Preview UCC Fare Estimates
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#F1F5F9]">
                  <div>
                    <div className="text-xs text-[#64748B]">Verified Fleet</div>
                    <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                      {verifiedCount} Drivers
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B]">UCC Stops</div>
                    <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                      {UCC_LOCATIONS.length} Locations
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B]">Starting Fare</div>
                    <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                      GH₵ 9.00
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-full bg-[#142B4A]">
              <img
                src={HERO_TAXI_IMAGE}
                alt="UCC CampusRide taxi sedan on Cape Coast university campus boulevard"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001632]/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
                <div className="text-white space-y-1">
                  <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#FFB689]">
                    Verified Ghana Plates & DVLA Checked
                  </div>
                  <p className="text-sm font-medium text-[#EFF1F3]">
                    Pay cash or Mobile Money directly to your driver upon arrival — no hidden app surcharges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10"
        >
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
              How CampusRide Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#142B4A] mt-1">
              From hall gate to lecture theatre in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                title: 'Select UCC Pickup & Drop-off',
                body: 'Choose from 16 campus landmarks including Valco, Casford, Oguaa, Sam Jonah Library, Amamoma, and West Gate, and preview your GH₵ fare estimate upfront.',
              },
              {
                step: '02',
                title: 'Match with a Verified Driver',
                body: 'Broadcast to available campus taxi union drivers or select a preferred driver verified by the UCC Transport Administration.',
              },
              {
                step: '03',
                title: 'Track Status & Settle Direct',
                body: 'Follow step-by-step ride updates from Accepted to Arrived and Completed, then settle directly via Cash, MTN MoMo, or Telecel Cash.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 space-y-3"
              >
                <span className="inline-block text-xs font-bold text-[#FF8A34] bg-[#FFDBC8]/50 px-2.5 py-1 rounded-md tabular-nums">
                  STEP {item.step}
                </span>
                <h3 className="text-lg font-bold text-[#142B4A]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Pre-Registration Campus Route & Fare Preview */}
        <section
          id="explore-zones"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10"
        >
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
                  Explore Before You Register
                </span>
                <h2 className="text-2xl font-bold text-[#142B4A] mt-1">
                  UCC Route & Fare Estimator
                </h2>
                <p className="text-sm text-[#64748B] mt-1.5">
                  Check estimated GH₵ fares and schematic routes between any two UCC campus zones before signing up.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="landing-pickup"
                    className="block text-xs font-semibold text-[#202938] mb-1"
                  >
                    Pickup Location
                  </label>
                  <select
                    id="landing-pickup"
                    value={previewPickup}
                    onChange={(e) => setPreviewPickup(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#202938]"
                  >
                    {UCC_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="landing-dropoff"
                    className="block text-xs font-semibold text-[#202938] mb-1"
                  >
                    Campus Drop-off
                  </label>
                  <select
                    id="landing-dropoff"
                    value={previewDropoff}
                    onChange={(e) => setPreviewDropoff(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#202938]"
                  >
                    {UCC_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span>Estimated Campus Shared Fare</span>
                  <span className="tabular-nums">
                    {previewEstimate.distanceKm > 0
                      ? `~${previewEstimate.distanceKm.toFixed(1)} km · ~${previewEstimate.estDurationMins} mins`
                      : 'Select distinct stops'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#142B4A] tabular-nums">
                  {previewEstimate.fareGhs > 0
                    ? formatGhs(previewEstimate.fareGhs)
                    : '—'}
                </div>
              </div>

              <Link
                to="/auth?mode=register&role=passenger"
                className="w-full h-11 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <span>Create Student Account to Book</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <CampusMapSchematic
                pickupId={previewPickup}
                dropoffId={previewDropoff}
                heightClass="h-[320px] sm:h-[370px]"
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section
          id="benefits"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10"
        >
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
              Built for Cape Coast Campus Transit
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#142B4A] mt-1">
              Why students and union drivers use CampusRide
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: 'Admin-Verified Drivers',
                desc: 'Every driver submits a DVLA license and Central Region plate reviewed by Admin before receiving rides.',
              },
              {
                icon: MapPin,
                title: 'UCC-Specific Landmarks',
                desc: 'Exact hall gates, lecture theatres, UCC Hospital, and hostel corridors like Amamoma, Ayensu, and Apewosika.',
              },
              {
                icon: Clock,
                title: 'Clear Trip Milestones',
                desc: 'Track status transitions from Requested to Driver Assigned, En Route, Arrived, and Completed.',
              },
              {
                icon: CheckCircle2,
                title: 'Direct GH₵ Settlement',
                desc: 'Transparent fare estimates settled directly with the driver in cash or Mobile Money on arrival.',
              },
            ].map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F2F4F6] text-[#142B4A] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#142B4A]">
                    {b.title}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Role Portals */}
        <section
          id="portals"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-16"
        >
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
              Choose Your Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#142B4A] mt-1">
              Sign in or register by role
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Passenger Portal */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFDBC8]/60 text-[#984800] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#142B4A]">
                  Student & Staff Passenger
                </h3>
                <p className="text-sm text-[#64748B]">
                  Explore UCC drivers, book campus rides, track active trip updates, and review full ride receipts.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth?mode=login&role=passenger"
                  className="flex-1 h-10 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center justify-center"
                >
                  Passenger Login
                </Link>
                <Link
                  to="/auth?mode=register&role=passenger"
                  className="flex-1 h-10 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#142B4A] text-xs font-semibold inline-flex items-center justify-center"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Driver Portal */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#D5E3FF] text-[#142B4A] flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#142B4A]">
                  UCC Campus Driver
                </h3>
                <p className="text-sm text-[#64748B]">
                  Register your vehicle and DVLA license, manage availability once verified, accept requests, and complete trips.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth?mode=login&role=driver"
                  className="flex-1 h-10 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center justify-center"
                >
                  Driver Login
                </Link>
                <Link
                  to="/auth?mode=register&role=driver"
                  className="flex-1 h-10 rounded-lg border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#142B4A] text-xs font-semibold inline-flex items-center justify-center"
                >
                  Apply as Driver
                </Link>
              </div>
            </div>

            {/* Admin Portal */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-6 flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#142B4A]">
                  Transport Administrator
                </h3>
                <p className="text-sm text-[#64748B]">
                  Monitor active campus rides, verify new driver applicants, and oversee user accounts across UCC. Authorized staff sign-in only.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <Link
                  to="/auth?mode=login&role=admin"
                  className="w-full h-10 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center justify-center"
                >
                  Admin Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-[#142B4A]">
              CampusRide UCC · Cape Coast, Ghana
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Demonstration platform stored locally in your browser (no live GPS or online payment processing)
            </span>
          </div>
          <span className="tabular-nums">
            UCC Campus Security: <strong className="text-[#202938]">+233 33 213 2440</strong>
          </span>
        </div>
      </footer>
    </div>
  );
};
