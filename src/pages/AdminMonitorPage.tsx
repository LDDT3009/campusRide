import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusRide } from '../context/CampusRideContext';
import { UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { CampusMapSchematic } from '../components/CampusMapSchematic';
import { StatusBadge } from '../components/StatusBadge';

type MonitorFilter = 'all' | 'active' | 'requested' | 'completed' | 'cancelled';

export const AdminMonitorPage: React.FC = () => {
  const {
    users,
    drivers,
    rides,
    adminReassignDriver,
    cancelRide,
  } = useCampusRide();

  const [filter, setFilter] = useState<MonitorFilter>('all');
  const [selectedRideId, setSelectedRideId] = useState<string>(
    rides.find((r) => !['completed', 'cancelled'].includes(r.status))?.id ||
      rides[0]?.id ||
      ''
  );

  const verifiedDrivers = drivers.filter(
    (d) => d.verificationStatus === 'verified'
  );
  const pendingDriversCount = drivers.filter(
    (d) => d.verificationStatus === 'pending'
  ).length;
  const activeRidesCount = rides.filter(
    (r) => !['completed', 'cancelled'].includes(r.status)
  ).length;
  const completedVolume = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + r.fareGhs, 0);

  const filteredRides = useMemo(() => {
    return rides.filter((r) => {
      if (filter === 'active') {
        return !['completed', 'cancelled'].includes(r.status);
      }
      if (filter === 'requested') return r.status === 'requested';
      if (filter === 'completed') return r.status === 'completed';
      if (filter === 'cancelled') return r.status === 'cancelled';
      return true;
    });
  }, [rides, filter]);

  const focusedRide =
    rides.find((r) => r.id === selectedRideId) || filteredRides[0] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
            UCC Campus Dispatch Operations
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Monitor campus rides, assign drivers to open requests, and oversee driver verification.
          </p>
        </div>
        {pendingDriversCount > 0 && (
          <Link
            to="/admin/drivers"
            className="h-10 px-4 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-xs font-semibold inline-flex items-center tabular-nums"
          >
            {pendingDriversCount} Driver Pending Verification →
          </Link>
        )}
      </div>

      {/* 4 KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Registered Users
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {users.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Verified Fleet
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {verifiedDrivers.length} / {drivers.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Active Rides
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {activeRidesCount}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5">
          <div className="text-xs font-semibold text-[#64748B]">
            Completed Fare Volume
          </div>
          <div className="text-2xl font-bold text-[#142B4A] tabular-nums mt-1">
            {formatGhs(completedVolume)}
          </div>
        </div>
      </div>

      {/* Main Split: Ride Monitoring Table + Map Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[#142B4A]">
              Campus Ride Monitor
            </h2>
            <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] rounded-lg overflow-x-auto">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'requested', label: 'Unassigned' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer ${
                    filter === tab.key
                      ? 'bg-white text-[#142B4A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredRides.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#64748B]">
              No rides match this filter.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {filteredRides.map((ride) => {
                const pickup = UCC_LOCATIONS.find(
                  (l) => l.id === ride.pickupLocationId
                );
                const dropoff = UCC_LOCATIONS.find(
                  (l) => l.id === ride.dropoffLocationId
                );
                const isSelected = focusedRide?.id === ride.id;
                const isTerminal = ['completed', 'cancelled'].includes(
                  ride.status
                );

                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedRideId(ride.id)}
                    className={`p-4 sm:px-5 space-y-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#142B4A] tabular-nums">
                            {ride.id}
                          </span>
                          <StatusBadge variant={ride.status} />
                          <span className="text-xs text-[#64748B]">
                            {ride.passengerName}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-[#202938] mt-1">
                          {pickup?.shortName} → {dropoff?.shortName}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-[#142B4A] tabular-nums">
                          {formatGhs(ride.fareGhs)}
                        </div>
                        <div className="text-[11px] text-[#64748B] tabular-nums">
                          {new Date(ride.createdAt).toLocaleTimeString('en-GH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>

                    {!isTerminal && (
                      <div
                        className="flex flex-wrap items-center gap-2 pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label={`Assign driver for ${ride.id}`}
                          value={ride.driverId || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              adminReassignDriver(ride.id, e.target.value);
                            }
                          }}
                          className="h-9 px-2.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
                        >
                          <option value="" disabled>
                            Assign verified driver...
                          </option>
                          {verifiedDrivers.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.plateNumber})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            cancelRide(
                              ride.id,
                              'admin',
                              'Cancelled by dispatch administrator'
                            )
                          }
                          className="h-9 px-3 rounded-lg border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6] text-xs font-semibold cursor-pointer"
                        >
                          Cancel Ride
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Focused Ride Schematic Map */}
        <div className="lg:col-span-5 space-y-4">
          <CampusMapSchematic
            pickupId={focusedRide?.pickupLocationId}
            dropoffId={focusedRide?.dropoffLocationId}
            activeStatus={focusedRide?.status}
            heightClass="h-[340px]"
          />
          {focusedRide && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#142B4A] tabular-nums">
                  Inspecting {focusedRide.id}
                </span>
                <StatusBadge variant={focusedRide.status} />
              </div>
              <div className="text-[#64748B]">
                Passenger: <strong className="text-[#202938]">{focusedRide.passengerName}</strong> ({focusedRide.passengerPhone})
              </div>
              <div className="text-[#64748B]">
                Driver:{' '}
                <strong className="text-[#202938]">
                  {focusedRide.driverId
                    ? drivers.find((d) => d.id === focusedRide.driverId)?.name
                    : 'Unassigned'}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
