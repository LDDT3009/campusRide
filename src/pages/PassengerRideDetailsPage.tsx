import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  Clock,
  Phone,
  RotateCw,
  Star,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { RIDE_TIERS, UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { CampusMapSchematic } from '../components/CampusMapSchematic';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

export const PassengerRideDetailsPage: React.FC = () => {
  const { rideId } = useParams<{ rideId: string }>();
  const { activePassenger, rides, drivers } = useCampusRide();
  const navigate = useNavigate();

  const ride = rides.find(
    (r) => r.id === rideId && r.passengerId === activePassenger.id
  );

  if (!ride) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-10 text-center space-y-4">
        <h1 className="text-xl font-bold text-[#142B4A]">Ride Not Found</h1>
        <p className="text-sm text-[#64748B]">
          We could not find ride record {rideId}. It may have been cleared from demonstration storage.
        </p>
        <Link
          to="/passenger/history"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#142B4A] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ride History</span>
        </Link>
      </div>
    );
  }

  const pickup = UCC_LOCATIONS.find((l) => l.id === ride.pickupLocationId);
  const dropoff = UCC_LOCATIONS.find((l) => l.id === ride.dropoffLocationId);
  const driver = ride.driverId
    ? drivers.find((d) => d.id === ride.driverId)
    : null;
  const isActive = !['completed', 'cancelled'].includes(ride.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/passenger/history"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#142B4A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Ride History</span>
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A] tabular-nums">
              Ride Details · {ride.id}
            </h1>
            <StatusBadge variant={ride.status} />
          </div>
          <p className="text-xs text-[#64748B] tabular-nums">
            Booked{' '}
            {new Date(ride.createdAt).toLocaleString('en-GH', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · Last updated{' '}
            {new Date(ride.updatedAt).toLocaleTimeString('en-GH', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isActive && (
            <Link
              to="/passenger/track"
              className="h-10 px-4 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center"
            >
              Open Live Status Tracker
            </Link>
          )}
          <button
            type="button"
            onClick={() =>
              navigate(
                `/passenger?pickup=${ride.pickupLocationId}&dropoff=${ride.dropoffLocationId}&tier=${ride.tier}`
              )
            }
            className="h-10 px-4 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Book Again</span>
          </button>
        </div>
      </div>

      {/* Cancellation Banner if Cancelled */}
      {ride.status === 'cancelled' && (
        <div className="bg-[#FFE4E6] border border-[#FDA4AF] rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#BE123C] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-[#93000A]">
              Trip Cancelled{' '}
              {ride.cancelledBy ? `by ${ride.cancelledBy}` : ''}
            </div>
            <div className="text-xs text-[#BE123C] mt-0.5">
              Reason: {ride.cancelReason || 'Cancelled prior to completion.'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Details Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Route & Receipt Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
              Route & Fare Receipt
            </h2>

            <div className="relative pl-6 space-y-4">
              <div
                aria-hidden="true"
                className="absolute left-[7px] top-2.5 bottom-2.5 w-px border-l-2 border-dashed border-[#94A3B8]"
              />
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#22A06B] bg-white" />
                <div className="text-[11px] font-semibold uppercase text-[#64748B]">
                  Pickup · {pickup?.zone}
                </div>
                <div className="text-sm font-bold text-[#202938]">
                  {pickup?.name}
                </div>
                <div className="text-xs text-[#64748B]">
                  {pickup?.landmarkHint}
                </div>
              </div>
              <div className="relative">
                <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#FF8A34]" />
                <div className="text-[11px] font-semibold uppercase text-[#64748B]">
                  Destination · {dropoff?.zone}
                </div>
                <div className="text-sm font-bold text-[#202938]">
                  {dropoff?.name}
                </div>
                <div className="text-xs text-[#64748B]">
                  {dropoff?.landmarkHint}
                </div>
              </div>
            </div>

            {ride.pickupNote && (
              <div className="text-xs bg-[#F8F9FB] border border-[#E2E8F0] rounded-lg p-3 text-[#44474E]">
                <strong className="text-[#142B4A]">Pickup Note:</strong>{' '}
                {ride.pickupNote}
              </div>
            )}

            <div className="pt-3 border-t border-[#F1F5F9] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Passenger</span>
                <span className="font-semibold text-[#202938]">
                  {ride.passengerName} ({ride.passengerPhone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Ride Tier</span>
                <span className="font-semibold text-[#202938]">
                  {RIDE_TIERS[ride.tier].label} · {ride.passengersCount}{' '}
                  {ride.passengersCount === 1 ? 'seat' : 'seats'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Payment Method</span>
                <span className="font-semibold text-[#202938]">
                  {ride.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#F1F5F9]">
                <span className="text-sm font-bold text-[#142B4A]">
                  {ride.status === 'cancelled' ? 'Estimated Fare' : 'Total Fare'}
                </span>
                <span className="text-lg font-bold text-[#142B4A] tabular-nums">
                  {formatGhs(ride.fareGhs)}
                </span>
              </div>
            </div>
          </div>

          {/* Driver & Vehicle Details Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
              Driver & Vehicle Information
            </h2>

            {driver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <DriverAvatar
                    name={driver.name}
                    avatarUrl={driver.avatarUrl}
                    size="lg"
                  />
                  <div>
                    <div className="text-base font-bold text-[#142B4A]">
                      {driver.name}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {driver.homeZone} Rank
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#202938] tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-[#FF8A34] text-[#FF8A34]" />
                        {driver.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#64748B] tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                        {driver.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9] text-xs">
                  <div>
                    <div className="text-[#64748B]">Vehicle Model</div>
                    <div className="font-semibold text-[#202938] mt-0.5 inline-flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#142B4A]" />
                      {driver.vehicleModel}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#64748B]">Plate Number</div>
                    <div className="font-bold text-[#142B4A] tabular-nums mt-0.5">
                      {driver.plateNumber}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] py-2">
                No driver was assigned to this ride.
              </div>
            )}
          </div>
        </div>

        {/* Right Map Column */}
        <div className="lg:col-span-7 space-y-4">
          <CampusMapSchematic
            pickupId={ride.pickupLocationId}
            dropoffId={ride.dropoffLocationId}
            activeStatus={ride.status}
            heightClass="h-[340px] sm:h-[420px]"
          />
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center justify-between text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#142B4A]" />
              Schematic UCC route snapshot
            </span>
            <span className="tabular-nums font-semibold text-[#142B4A]">
              {pickup?.shortName} → {dropoff?.shortName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
