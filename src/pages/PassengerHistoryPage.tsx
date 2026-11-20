import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, RotateCw, Search } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { UCC_LOCATIONS, formatGhs } from '../data/uccData';
import { StatusBadge } from '../components/StatusBadge';

type HistoryFilter = 'all' | 'active' | 'completed' | 'cancelled';

export const PassengerHistoryPage: React.FC = () => {
  const { activePassenger, rides, drivers } = useCampusRide();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [search, setSearch] = useState('');

  const myRides = useMemo(() => {
    return rides.filter((r) => {
      if (r.passengerId !== activePassenger.id) return false;

      if (filter === 'active') {
        if (['completed', 'cancelled'].includes(r.status)) return false;
      } else if (filter === 'completed' && r.status !== 'completed') {
        return false;
      } else if (filter === 'cancelled' && r.status !== 'cancelled') {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const from =
          UCC_LOCATIONS.find((l) => l.id === r.pickupLocationId)?.name || '';
        const to =
          UCC_LOCATIONS.find((l) => l.id === r.dropoffLocationId)?.name || '';
        const drv =
          drivers.find((d) => d.id === r.driverId)?.name || '';
        return (
          r.id.toLowerCase().includes(q) ||
          from.toLowerCase().includes(q) ||
          to.toLowerCase().includes(q) ||
          drv.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [rides, activePassenger.id, filter, search, drivers]);

  const totalSpent = useMemo(
    () =>
      rides
        .filter(
          (r) =>
            r.passengerId === activePassenger.id && r.status === 'completed'
        )
        .reduce((sum, r) => sum + r.fareGhs, 0),
    [rides, activePassenger.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
            Ride History · {activePassenger.name}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Open any trip to view complete driver, vehicle, and route details, or rebook a route.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-right shadow-campus-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Completed Trip Total
          </div>
          <div className="text-lg font-bold text-[#142B4A] tabular-nums">
            {formatGhs(totalSpent)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#F2F4F6] rounded-lg self-start overflow-x-auto max-w-full">
          {(
            [
              { key: 'all', label: 'All Trips' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-white text-[#142B4A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#142B4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by hall, driver, or ride ID"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-[#F8F9FB] border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
          />
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden">
        {myRides.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm font-semibold text-[#202938]">
              No trips match this filter.
            </p>
            <button
              type="button"
              onClick={() => navigate('/passenger')}
              className="h-10 px-4 rounded-lg bg-[#FF8A34] text-white text-xs font-semibold cursor-pointer"
            >
              Book a New Campus Ride
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {myRides.map((ride) => {
              const pickup = UCC_LOCATIONS.find(
                (l) => l.id === ride.pickupLocationId
              );
              const dropoff = UCC_LOCATIONS.find(
                (l) => l.id === ride.dropoffLocationId
              );
              const driver = ride.driverId
                ? drivers.find((d) => d.id === ride.driverId)
                : null;

              return (
                <div
                  key={ride.id}
                  onClick={() => navigate(`/passenger/history/${ride.id}`)}
                  className="p-4 sm:px-6 hover:bg-[#F8FAFC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-[#142B4A] tabular-nums">
                        {ride.id}
                      </span>
                      <StatusBadge variant={ride.status} />
                      <span className="text-xs text-[#64748B] tabular-nums">
                        {new Date(ride.createdAt).toLocaleDateString('en-GH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        ·{' '}
                        {new Date(ride.createdAt).toLocaleTimeString('en-GH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[#202938]">
                      {pickup?.name} → {dropoff?.name}
                    </div>

                    <div className="text-xs text-[#64748B]">
                      {driver
                        ? `${driver.name} (${driver.plateNumber})`
                        : 'Pending driver assignment'}{' '}
                      · {ride.paymentMethod}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between sm:justify-end gap-3 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-left sm:text-right mr-1">
                      <div className="text-base font-bold text-[#142B4A] tabular-nums">
                        {formatGhs(ride.fareGhs)}
                      </div>
                      <div className="text-[11px] text-[#64748B] capitalize">
                        {ride.tier} tier
                      </div>
                    </div>

                    <Link
                      to={`/passenger/history/${ride.id}`}
                      className="h-9 px-3 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/passenger?pickup=${ride.pickupLocationId}&dropoff=${ride.dropoffLocationId}&tier=${ride.tier}`
                        )
                      }
                      className="h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F2F4F6] text-xs font-semibold text-[#142B4A] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Book Again</span>
                    </button>
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
