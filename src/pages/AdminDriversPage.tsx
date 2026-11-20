import React, { useMemo, useState } from 'react';
import { Phone, ShieldAlert, ShieldCheck, Star } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { VerificationStatus } from '../types/campus';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

type DriverFilter = 'all' | VerificationStatus;

export const AdminDriversPage: React.FC = () => {
  const { drivers, verifyDriver, suspendDriver, restoreDriver } =
    useCampusRide();
  const [filter, setFilter] = useState<DriverFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return drivers;
    return drivers.filter((d) => d.verificationStatus === filter);
  }, [drivers, filter]);

  const counts = {
    all: drivers.length,
    pending: drivers.filter((d) => d.verificationStatus === 'pending').length,
    verified: drivers.filter((d) => d.verificationStatus === 'verified').length,
    suspended: drivers.filter((d) => d.verificationStatus === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
            Driver Verification & Fleet Compliance
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Review DVLA licenses, Central Region plates, and approve drivers for UCC campus pickups.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-lg">
          {(
            [
              { key: 'all', label: `All (${counts.all})` },
              { key: 'pending', label: `Pending (${counts.pending})` },
              { key: 'verified', label: `Verified (${counts.verified})` },
              { key: 'suspended', label: `Suspended (${counts.suspended})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer tabular-nums ${
                filter === tab.key
                  ? 'bg-[#142B4A] text-white'
                  : 'text-[#64748B] hover:text-[#142B4A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center text-sm text-[#64748B]">
          No drivers in this verification status category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((driver) => (
            <div
              key={driver.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 space-y-4"
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
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {driver.vehicleModel}
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge variant={driver.verificationStatus} />
                      {driver.verificationStatus === 'verified' && (
                        <StatusBadge
                          variant={driver.isAvailable ? 'available' : 'offline'}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div className="inline-flex items-center gap-1 font-bold text-[#142B4A] tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-[#FF8A34] text-[#FF8A34]" />
                    {driver.rating.toFixed(1)}
                  </div>
                  <div className="text-[#64748B] tabular-nums mt-0.5">
                    {driver.completedTrips} trips
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-[#F1F5F9] text-xs">
                <div>
                  <div className="text-[#64748B]">DVLA License</div>
                  <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                    {driver.licenseNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Vehicle Plate</div>
                  <div className="font-bold text-[#202938] tabular-nums mt-0.5">
                    {driver.plateNumber}
                  </div>
                </div>
                <div>
                  <div className="text-[#64748B]">Assigned Zone</div>
                  <div className="font-semibold text-[#202938] mt-0.5">
                    {driver.homeZone}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-[#142B4A]" />
                  {driver.phone}
                </span>

                <div className="flex items-center gap-2">
                  {driver.verificationStatus === 'pending' && (
                    <button
                      type="button"
                      onClick={() => verifyDriver(driver.id)}
                      className="h-9 px-3.5 rounded-lg bg-[#22A06B] hover:bg-[#15803D] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify Driver</span>
                    </button>
                  )}

                  {driver.verificationStatus === 'verified' && (
                    <button
                      type="button"
                      onClick={() => suspendDriver(driver.id)}
                      className="h-9 px-3.5 rounded-lg border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  )}

                  {driver.verificationStatus === 'suspended' && (
                    <button
                      type="button"
                      onClick={() => restoreDriver(driver.id)}
                      className="h-9 px-3.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer"
                    >
                      Restore Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
