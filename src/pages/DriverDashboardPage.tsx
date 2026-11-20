import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Check,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  User,
  X,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { RIDE_TIERS, UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { RideStatus } from '../types/campus';
import { CampusMapSchematic } from '../components/CampusMapSchematic';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

const NEXT_ACTION_MAP: Partial<
  Record<RideStatus, { next: RideStatus; label: string }>
> = {
  accepted: { next: 'en_route', label: 'Head to Pickup (En Route)' },
  en_route: { next: 'arrived', label: 'Mark Arrived at Pickup' },
  arrived: { next: 'in_progress', label: 'Start Trip (Passenger Onboard)' },
  in_progress: { next: 'completed', label: 'Complete Trip & Settle Fare' },
};

export const DriverDashboardPage: React.FC = () => {
  const {
    activeDriver,
    rides,
    toggleDriverAvailability,
    acceptRideRequest,
    declineRideRequest,
    advanceRideStatus,
    cancelRide,
  } = useCampusRide();

  const [cancellingRideId, setCancellingRideId] = useState<string | null>(null);

  const isVerified = activeDriver.verificationStatus === 'verified';

  const activeDriverRide = useMemo(
    () =>
      rides.find(
        (r) =>
          r.driverId === activeDriver.id &&
          !['completed', 'cancelled', 'requested'].includes(r.status)
      ) || null,
    [rides, activeDriver.id]
  );

  const incomingRequests = useMemo(() => {
    if (!isVerified || !activeDriver.isAvailable) return [];
    return rides.filter(
      (r) =>
        r.status === 'requested' &&
        !r.declinedByDriverIds.includes(activeDriver.id) &&
        (r.driverId === null || r.driverId === activeDriver.id)
    );
  }, [rides, activeDriver.id, activeDriver.isAvailable, isVerified]);

  const completedTodayCount = useMemo(
    () =>
      rides.filter(
        (r) => r.driverId === activeDriver.id && r.status === 'completed'
      ).length,
    [rides, activeDriver.id]
  );

  const nextStepAction = activeDriverRide
    ? NEXT_ACTION_MAP[activeDriverRide.status]
    : undefined;

  return (
    <div className="space-y-6">
      {/* Driver Header & Availability Toggle */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <DriverAvatar
            name={activeDriver.name}
            avatarUrl={activeDriver.avatarUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#142B4A]">
                {activeDriver.name}
              </h1>
              <StatusBadge variant={activeDriver.verificationStatus} />
            </div>
            <div className="text-xs sm:text-sm text-[#64748B] mt-1">
              {activeDriver.vehicleModel} ·{' '}
              <strong className="text-[#202938] tabular-nums">
                {activeDriver.plateNumber}
              </strong>{' '}
              · {activeDriver.homeZone}
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-[#64748B] tabular-nums">
              <span className="inline-flex items-center gap-1 font-semibold text-[#202938]">
                <Star className="w-3.5 h-3.5 fill-[#FF8A34] text-[#FF8A34]" />
                {activeDriver.rating.toFixed(1)}
              </span>
              <span>{completedTodayCount} logged trips</span>
              <span>{activeDriver.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/driver/profile"
            className="h-10 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#142B4A] inline-flex items-center"
          >
            Edit Vehicle & Profile
          </Link>

          <button
            type="button"
            disabled={!isVerified}
            onClick={() => toggleDriverAvailability(activeDriver.id)}
            className={`h-10 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              activeDriver.isAvailable
                ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] hover:bg-[#BBF7D0]'
                : 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] hover:bg-[#E2E8F0]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeDriver.isAvailable ? 'bg-[#22A06B]' : 'bg-[#64748B]'
              }`}
            />
            <span>
              {activeDriver.isAvailable
                ? 'Available (Demo Queue)'
                : 'Offline (Demo Queue)'}
            </span>
          </button>
        </div>
      </div>

      {/* Verification Gate if Pending or Suspended */}
      {!isVerified ? (
        <div className="bg-white rounded-2xl border border-[#FDE68A] shadow-campus-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-start gap-3.5">
            <AlertCircle className="w-6 h-6 text-[#B45309] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-[#142B4A]">
                {activeDriver.verificationStatus === 'pending'
                  ? 'Driver Verification Pending'
                  : 'Driver Account Suspended'}
              </h2>
              <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
                {activeDriver.verificationStatus === 'pending'
                  ? 'Active driver dispatch features—including going online, viewing incoming student ride requests, and accepting trips—are locked until a CampusRide Administrator verifies your DVLA license and Ghana plate number.'
                  : 'Your driver dispatch privileges have been suspended by an Administrator. Please contact the Directorate of Campus Transport.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F8F9FB] border border-[#E2E8F0] text-xs">
            <div>
              <div className="text-[#64748B]">DVLA License Number</div>
              <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                {activeDriver.licenseNumber}
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Vehicle & Plate</div>
              <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                {activeDriver.vehicleModel} · {activeDriver.plateNumber}
              </div>
            </div>
            <div>
              <div className="text-[#64748B]">Primary UCC Zone</div>
              <div className="font-semibold text-[#202938] mt-0.5">
                {activeDriver.homeZone}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/driver/profile"
              className="h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center"
            >
              Review or Update Vehicle Credentials
            </Link>
          </div>
        </div>
      ) : (
        /* Main 2-Column Verified Driver Workspace */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Active Ride + Incoming Requests */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Ride Control Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-md p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#142B4A]">
                Active Assigned Trip
              </h2>
              {activeDriverRide && (
                <StatusBadge variant={activeDriverRide.status} />
              )}
            </div>

            {!activeDriverRide ? (
              <div className="py-6 text-center space-y-2 border border-dashed border-[#CBD5E1] rounded-xl bg-[#F8F9FB]">
                <Navigation className="w-6 h-6 text-[#64748B] mx-auto" />
                <p className="text-sm font-semibold text-[#202938]">
                  No active trip in progress
                </p>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  Accept an incoming ride request below to start pickup and trip status updates.
                </p>
              </div>
            ) : (
              (() => {
                const pickup = UCC_LOCATIONS.find(
                  (l) => l.id === activeDriverRide.pickupLocationId
                );
                const dropoff = UCC_LOCATIONS.find(
                  (l) => l.id === activeDriverRide.dropoffLocationId
                );

                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                      <div>
                        <div className="text-xs font-bold text-[#142B4A] tabular-nums">
                          {activeDriverRide.id} ·{' '}
                          {RIDE_TIERS[activeDriverRide.tier].label}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#202938]">
                            <User className="w-3.5 h-3.5 text-[#142B4A]" />
                            {activeDriverRide.passengerName}
                          </span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                            {activeDriverRide.passengerPhone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                          {formatGhs(activeDriverRide.fareGhs)}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {activeDriverRide.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="relative pl-6 space-y-3">
                      <div
                        aria-hidden="true"
                        className="absolute left-[7px] top-2.5 bottom-2.5 w-px border-l-2 border-dashed border-[#94A3B8]"
                      />
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#22A06B] bg-white" />
                        <div className="text-[11px] font-semibold uppercase text-[#64748B]">
                          Pickup ({pickup?.zone})
                        </div>
                        <div className="text-sm font-bold text-[#202938]">
                          {pickup?.name}
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#FF8A34]" />
                        <div className="text-[11px] font-semibold uppercase text-[#64748B]">
                          Drop-off ({dropoff?.zone})
                        </div>
                        <div className="text-sm font-bold text-[#202938]">
                          {dropoff?.name}
                        </div>
                      </div>
                    </div>

                    {activeDriverRide.pickupNote && (
                      <div className="text-xs bg-[#F8F9FB] border border-[#E2E8F0] rounded-lg p-3 text-[#44474E]">
                        <strong className="text-[#142B4A]">Student Note:</strong>{' '}
                        {activeDriverRide.pickupNote}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      {nextStepAction && (
                        <button
                          type="button"
                          onClick={() =>
                            advanceRideStatus(
                              activeDriverRide.id,
                              nextStepAction.next
                            )
                          }
                          className="flex-1 h-11 px-4 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                          {nextStepAction.label}
                        </button>
                      )}

                      {activeDriverRide.status !== 'in_progress' &&
                        (cancellingRideId === activeDriverRide.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                cancelRide(
                                  activeDriverRide.id,
                                  'driver',
                                  'Cancelled by driver before pickup'
                                );
                                setCancellingRideId(null);
                              }}
                              className="h-11 px-3 rounded-lg bg-[#E11D48] text-white text-xs font-semibold cursor-pointer"
                            >
                              Confirm Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancellingRideId(null)}
                              className="h-11 px-3 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#202938] cursor-pointer"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setCancellingRideId(activeDriverRide.id)
                            }
                            className="h-11 px-4 rounded-lg border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6] text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* Incoming Ride Requests Queue */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#142B4A]">
                  Incoming Ride Requests
                </h2>
                <p className="text-xs text-[#64748B]">
                  Requests from UCC passengers matching your verification status.
                </p>
              </div>
              <span className="text-xs font-bold text-[#142B4A] bg-[#F2F4F6] px-2.5 py-1 rounded-full tabular-nums">
                {incomingRequests.length} open
              </span>
            </div>

            {!activeDriver.isAvailable || !isVerified ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                {!isVerified
                  ? 'Verification required to receive campus ride requests.'
                  : 'Switch your status to Available above to view incoming ride requests.'}
              </div>
            ) : incomingRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                No pending requests in the queue right now. Book a ride in Passenger view to test incoming dispatch!
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {incomingRequests.map((req) => {
                  const pickup = UCC_LOCATIONS.find(
                    (l) => l.id === req.pickupLocationId
                  );
                  const dropoff = UCC_LOCATIONS.find(
                    (l) => l.id === req.dropoffLocationId
                  );
                  const isDirect = req.driverId === activeDriver.id;

                  return (
                    <div key={req.id} className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#142B4A] tabular-nums">
                              {req.id}
                            </span>
                            {isDirect && (
                              <span className="text-[11px] font-semibold text-[#984800] bg-[#FFDBC8] px-2 py-0.5 rounded-full">
                                Direct Request
                              </span>
                            )}
                            <span className="text-xs text-[#64748B]">
                              {req.passengersCount}{' '}
                              {req.passengersCount === 1 ? 'seat' : 'seats'} ·{' '}
                              {RIDE_TIERS[req.tier].label}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-[#202938] mt-1">
                            {pickup?.shortName} → {dropoff?.shortName}
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5">
                            {req.passengerName} ·{' '}
                            <span className="tabular-nums">
                              {req.passengerPhone}
                            </span>
                          </div>
                          {req.pickupNote && (
                            <p className="text-xs text-[#44474E] mt-1 italic">
                              “{req.pickupNote}”
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-bold text-[#142B4A] tabular-nums">
                            {formatGhs(req.fareGhs)}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {req.paymentMethod.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={Boolean(activeDriverRide)}
                          onClick={() =>
                            acceptRideRequest(req.id, activeDriver.id)
                          }
                          className="flex-1 h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>
                            {activeDriverRide
                              ? 'Finish Active Trip First'
                              : 'Accept Request'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            declineRideRequest(req.id, activeDriver.id)
                          }
                          className="h-10 px-3.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-semibold text-[#64748B] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Schematic Map & Driver Credentials */}
        <div className="lg:col-span-6 space-y-5">
          <CampusMapSchematic
            pickupId={
              activeDriverRide?.pickupLocationId ||
              incomingRequests[0]?.pickupLocationId
            }
            dropoffId={
              activeDriverRide?.dropoffLocationId ||
              incomingRequests[0]?.dropoffLocationId
            }
            activeStatus={activeDriverRide?.status}
            heightClass="h-[340px] sm:h-[400px]"
          />

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#142B4A]">
              <ShieldCheck className="w-4 h-4 text-[#22A06B]" />
              <span>UCC Transport Union Credentials</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <div className="text-[#64748B]">DVLA License</div>
                <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                  {activeDriver.licenseNumber}
                </div>
              </div>
              <div>
                <div className="text-[#64748B]">Registered Plate</div>
                <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                  {activeDriver.plateNumber}
                </div>
              </div>
              <div>
                <div className="text-[#64748B]">Primary Rank</div>
                <div className="font-semibold text-[#202938] mt-0.5 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF8A34]" />
                  {activeDriver.homeZone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
