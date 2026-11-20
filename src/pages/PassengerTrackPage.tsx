import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Car,
  Check,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { RIDE_TIERS, UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { RideStatus } from '../types/campus';
import { CampusMapSchematic } from '../components/CampusMapSchematic';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

const STEP_ORDER: Array<{ key: RideStatus; label: string; desc: string }> = [
  { key: 'requested', label: 'Requested', desc: 'Waiting for driver confirmation' },
  { key: 'accepted', label: 'Assigned', desc: 'Driver accepted your request' },
  { key: 'en_route', label: 'En Route', desc: 'Driver heading to pickup stop' },
  { key: 'arrived', label: 'Arrived', desc: 'Driver waiting at pickup point' },
  { key: 'in_progress', label: 'On Trip', desc: 'Heading toward campus drop-off' },
  { key: 'completed', label: 'Completed', desc: 'Arrived & fare settled' },
];

export const PassengerTrackPage: React.FC = () => {
  const {
    activePassenger,
    rides,
    drivers,
    cancelRide,
  } = useCampusRide();

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed travel plans');

  const passengerRides = rides.filter(
    (r) => r.passengerId === activePassenger.id
  );
  const activeRide = passengerRides.find(
    (r) => !['completed', 'cancelled'].includes(r.status)
  );
  const displayRide = activeRide || passengerRides[0] || null;

  if (!displayRide) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F2F4F6] text-[#142B4A] flex items-center justify-center mx-auto">
          <Car className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#142B4A]">
          No rides requested yet for {activePassenger.name}
        </h1>
        <p className="text-sm text-[#64748B] max-w-md mx-auto">
          Book a ride across UCC Old Site, New Site, or surrounding hostels to track status updates here.
        </p>
        <Link
          to="/passenger"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold"
        >
          <span>Book a Campus Ride</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const pickup = UCC_LOCATIONS.find((l) => l.id === displayRide.pickupLocationId);
  const dropoff = UCC_LOCATIONS.find(
    (l) => l.id === displayRide.dropoffLocationId
  );
  const assignedDriver = displayRide.driverId
    ? drivers.find((d) => d.id === displayRide.driverId)
    : null;

  const currentStepIndex = STEP_ORDER.findIndex(
    (s) => s.key === displayRide.status
  );
  const canCancel = ['requested', 'accepted', 'en_route', 'arrived'].includes(
    displayRide.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A] tabular-nums">
              Ride {displayRide.id}
            </h1>
            <StatusBadge variant={displayRide.status} />
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Passenger: <strong className="text-[#202938]">{displayRide.passengerName}</strong> ·{' '}
            <span className="tabular-nums">{displayRide.passengerPhone}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/passenger/history"
            className="h-10 px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#142B4A] text-xs font-semibold inline-flex items-center"
          >
            Ride History
          </Link>
          <Link
            to="/passenger"
            className="h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center"
          >
            New Booking
          </Link>
        </div>
      </div>

      {/* Status Stepper */}
      {displayRide.status !== 'cancelled' ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
              Trip Status Progression
            </h2>
            <span className="text-xs text-[#64748B] tabular-nums">
              Updated{' '}
              {new Date(displayRide.updatedAt).toLocaleTimeString('en-GH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STEP_ORDER.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border transition-colors ${
                    isCurrent
                      ? 'border-[#142B4A] bg-[#F8FAFC] ring-1 ring-[#142B4A]'
                      : isCompleted
                        ? 'border-[#DCFCE7] bg-[#F0FDF4]'
                        : 'border-[#E2E8F0] bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold tabular-nums shrink-0 ${
                        isCurrent
                          ? 'bg-[#FF8A34] text-white'
                          : isCompleted
                            ? 'bg-[#22A06B] text-white'
                            : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#142B4A]">
                      {step.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1.5 leading-snug">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-[#FFE4E6] border border-[#FDA4AF] rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#BE123C] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-[#93000A]">
              This ride was cancelled
            </h2>
            <p className="text-xs text-[#BE123C] mt-0.5">
              {displayRide.cancelReason || 'Cancelled before pickup.'}
            </p>
          </div>
        </div>
      )}

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          {/* Driver Details Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
              Assigned Driver
            </h2>

            {assignedDriver ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <DriverAvatar
                      name={assignedDriver.name}
                      avatarUrl={assignedDriver.avatarUrl}
                      size="lg"
                    />
                    <div>
                      <div className="text-base font-bold text-[#142B4A]">
                        {assignedDriver.name}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {assignedDriver.vehicleModel}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <span className="font-bold text-[#202938] bg-[#F2F4F6] px-2 py-0.5 rounded tabular-nums">
                          {assignedDriver.plateNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#202938] tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-[#FF8A34] text-[#FF8A34]" />
                          {assignedDriver.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Driver Contact</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#142B4A] tabular-nums">
                    <Phone className="w-3.5 h-3.5" />
                    {assignedDriver.phone}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 px-3 rounded-xl bg-[#FEF3C7]/60 border border-[#FDE68A] text-xs text-[#92400E] space-y-1.5">
                <div className="font-bold">Broadcasting to available UCC drivers</div>
                <p>
                  No driver has accepted this request yet. Switch to the Driver Desk to accept it as an available driver.
                </p>
              </div>
            )}
          </div>

          {/* Route & Fare Breakdown Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
              Trip Summary
            </h2>

            <div className="relative pl-6 space-y-4">
              <div
                aria-hidden="true"
                className="absolute left-[7px] top-2.5 bottom-2.5 w-px border-l-2 border-dashed border-[#94A3B8]"
              />
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#22A06B] bg-white" />
                <div className="text-[11px] uppercase tracking-[0.04em] text-[#64748B] font-semibold">
                  Pickup · {pickup?.zone}
                </div>
                <div className="text-sm font-bold text-[#202938]">
                  {pickup?.name}
                </div>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#FF8A34]" />
                <div className="text-[11px] uppercase tracking-[0.04em] text-[#64748B] font-semibold">
                  Drop-off · {dropoff?.zone}
                </div>
                <div className="text-sm font-bold text-[#202938]">
                  {dropoff?.name}
                </div>
              </div>
            </div>

            {displayRide.pickupNote && (
              <div className="text-xs bg-[#F8F9FB] border border-[#E2E8F0] rounded-lg p-3 text-[#44474E]">
                <strong className="text-[#142B4A]">Pickup note:</strong>{' '}
                {displayRide.pickupNote}
              </div>
            )}

            <div className="pt-3 border-t border-[#F1F5F9] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Ride Class</span>
                <span className="font-semibold text-[#202938]">
                  {RIDE_TIERS[displayRide.tier].label} · {displayRide.passengersCount}{' '}
                  {displayRide.passengersCount === 1 ? 'seat' : 'seats'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Settlement Method</span>
                <span className="font-semibold text-[#202938]">
                  {displayRide.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9]">
                <span className="text-sm font-bold text-[#142B4A]">
                  Estimated Fare
                </span>
                <span className="text-lg font-bold text-[#142B4A] tabular-nums">
                  {formatGhs(displayRide.fareGhs)}
                </span>
              </div>
            </div>

            {/* Cancel Action */}
            {canCancel && (
              <div className="pt-2">
                {!confirmCancelOpen ? (
                  <button
                    type="button"
                    onClick={() => setConfirmCancelOpen(true)}
                    className="w-full h-10 rounded-lg border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel Ride Request
                  </button>
                ) : (
                  <div className="p-3 rounded-xl bg-[#FFE4E6]/60 border border-[#FDA4AF] space-y-2.5">
                    <label className="block text-xs font-semibold text-[#93000A]">
                      Confirm cancellation reason:
                    </label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-md bg-white border border-[#FDA4AF] text-xs text-[#202938]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          cancelRide(displayRide.id, 'passenger', cancelReason);
                          setConfirmCancelOpen(false);
                        }}
                        className="flex-1 h-9 rounded-md bg-[#E11D48] text-white text-xs font-semibold cursor-pointer"
                      >
                        Confirm Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmCancelOpen(false)}
                        className="h-9 px-3 rounded-md bg-white border border-[#CBD5E1] text-xs font-semibold text-[#202938] cursor-pointer"
                      >
                        Keep Ride
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campus Security Info */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#E11D48] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#202938]">
                  UCC Campus Security Desk
                </div>
                <div className="text-[11px] text-[#64748B]">
                  24/7 Campus Escort & Incident Line
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#142B4A] tabular-nums whitespace-nowrap">
              +233 33 213 2440
            </span>
          </div>
        </div>

        {/* Right Column: Schematic Route Map */}
        <div className="lg:col-span-7 space-y-4">
          <CampusMapSchematic
            pickupId={displayRide.pickupLocationId}
            dropoffId={displayRide.dropoffLocationId}
            activeStatus={displayRide.status}
            heightClass="h-[340px] sm:h-[440px]"
          />
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#142B4A]" />
              Schematic position reflects current ride status stage.
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#142B4A]" />
              Requested{' '}
              {new Date(displayRide.createdAt).toLocaleString('en-GH', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
