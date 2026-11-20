import React, { useMemo } from 'react';
import { useCampusRide } from '../context/CampusRideContext';
import { UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { StatusBadge } from '../components/StatusBadge';

export const DriverTripsPage: React.FC = () => {
  const { activeDriver, rides } = useCampusRide();

  const driverRides = useMemo(
    () => rides.filter((r) => r.driverId === activeDriver.id),
    [rides, activeDriver.id]
  );

  const completedRides = driverRides.filter((r) => r.status === 'completed');
  const demoRevenue = completedRides.reduce((sum, r) => sum + r.fareGhs, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
          Trip Log & Demo Earnings · {activeDriver.name}
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Summary of trips handled in CampusRide demonstration storage.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Completed Demo Trips
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {completedRides.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Cash / MoMo Collected
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {formatGhs(demoRevenue)}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Union Rating & Career Trips
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {activeDriver.rating.toFixed(1)} · {activeDriver.completedTrips}
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-bold text-[#142B4A]">
            Assigned Trip Ledger
          </h2>
        </div>

        {driverRides.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">
            No trips logged for {activeDriver.name} yet.
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {driverRides.map((ride) => {
              const pickup = UCC_LOCATIONS.find(
                (l) => l.id === ride.pickupLocationId
              );
              const dropoff = UCC_LOCATIONS.find(
                (l) => l.id === ride.dropoffLocationId
              );

              return (
                <div
                  key={ride.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8FAFC]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#142B4A] tabular-nums">
                        {ride.id}
                      </span>
                      <StatusBadge variant={ride.status} />
                      <span className="text-xs text-[#64748B] tabular-nums">
                        {new Date(ride.createdAt).toLocaleString('en-GH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[#202938]">
                      {pickup?.name} → {dropoff?.name}
                    </div>
                    <div className="text-xs text-[#64748B]">
                      Passenger: {ride.passengerName} ({ride.passengerPhone}) ·{' '}
                      {ride.paymentMethod}
                    </div>
                  </div>
                  <div className="text-base font-bold text-[#142B4A] tabular-nums shrink-0">
                    {formatGhs(ride.fareGhs)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
