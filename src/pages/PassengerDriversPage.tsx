import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Search, ShieldCheck, Star, Users } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { CampusZone } from '../types/campus';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

const ZONES: Array<'All' | CampusZone> = [
  'All',
  'New Site',
  'Old Site',
  'Central Academic',
  'Hostel Corridor',
];

export const PassengerDriversPage: React.FC = () => {
  const { drivers } = useCampusRide();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<'All' | CampusZone>('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      if (d.verificationStatus === 'suspended') return false;
      if (zoneFilter !== 'All' && d.homeZone !== zoneFilter) return false;
      if (onlyAvailable && (!d.isAvailable || d.verificationStatus !== 'verified')) {
        return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.vehicleModel.toLowerCase().includes(q) ||
          d.plateNumber.toLowerCase().includes(q) ||
          d.homeZone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [drivers, zoneFilter, onlyAvailable, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
            UCC Campus Drivers Directory
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Browse verified union drivers stationed across Cape Coast campus zones. Availability reflects local demonstration state.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search driver name, car model, or plate (e.g. CR 4821)"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#F8F9FB] border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] rounded-lg overflow-x-auto">
            {ZONES.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoneFilter(z)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  zoneFilter === z
                    ? 'bg-white text-[#142B4A] shadow-sm'
                    : 'text-[#64748B] hover:text-[#142B4A]'
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#202938] cursor-pointer select-none px-2">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 rounded border-[#94A3B8] accent-[#142B4A]"
            />
            <span>Available only</span>
          </label>
        </div>
      </div>

      {/* Drivers Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center space-y-3">
          <p className="text-base font-semibold text-[#202938]">
            No drivers match your current filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setZoneFilter('All');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#142B4A] text-white text-xs font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDrivers.map((driver) => {
            const isVerified = driver.verificationStatus === 'verified';
            const canBook = isVerified && driver.isAvailable;

            return (
              <div
                key={driver.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <DriverAvatar
                      name={driver.name}
                      avatarUrl={driver.avatarUrl}
                      size="lg"
                    />
                    <div>
                      <h2 className="text-base font-bold text-[#142B4A]">
                        {driver.name}
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {driver.vehicleModel}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusBadge
                          variant={
                            !isVerified
                              ? 'pending'
                              : driver.isAvailable
                                ? 'available'
                                : 'offline'
                          }
                        />
                        {driver.supportsAccessible && (
                          <span className="text-[11px] font-semibold text-[#142B4A] bg-[#D5E3FF] px-2 py-0.5 rounded-full">
                            Accessible / Group
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-sm font-bold text-[#142B4A] tabular-nums">
                      <Star className="w-4 h-4 fill-[#FF8A34] text-[#FF8A34]" />
                      <span>{driver.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] tabular-nums">
                      {driver.completedTrips} trips
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-3 border-y border-[#F1F5F9] text-xs">
                  <div>
                    <div className="text-[#64748B]">Plate Number</div>
                    <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                      {driver.plateNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#64748B]">Stationed Zone</div>
                    <div className="font-semibold text-[#202938] mt-0.5">
                      {driver.homeZone}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#64748B]">Capacity</div>
                    <div className="font-semibold text-[#202938] mt-0.5 inline-flex items-center gap-1 tabular-nums">
                      <Users className="w-3.5 h-3.5 text-[#64748B]" />
                      {driver.seats} seats
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                    <span>{driver.phone}</span>
                  </div>

                  {canBook ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/passenger?driverId=${driver.id}`)}
                      className="h-10 px-4 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Book with {driver.name.split(' ')[0]}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {!isVerified
                        ? 'Awaiting Admin Verification'
                        : 'Currently Offline'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
