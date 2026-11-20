import React, { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import { normalizeGhanaPhone } from '../data/uccData';
import { CampusZone } from '../types/campus';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentDriverProfile, updateProfile } = useCampusRide();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [studentOrStaffId, setStudentOrStaffId] = useState(
    currentUser?.studentOrStaffId || ''
  );
  const [hallOrDepartment, setHallOrDepartment] = useState(
    currentUser?.hallOrDepartment || ''
  );

  // Driver-specific fields
  const [vehicleModel, setVehicleModel] = useState(
    currentDriverProfile?.vehicleModel || ''
  );
  const [vehicleColor, setVehicleColor] = useState(
    currentDriverProfile?.vehicleColor || ''
  );
  const [plateNumber, setPlateNumber] = useState(
    currentDriverProfile?.plateNumber || ''
  );
  const [licenseNumber, setLicenseNumber] = useState(
    currentDriverProfile?.licenseNumber || ''
  );
  const [homeZone, setHomeZone] = useState<CampusZone>(
    currentDriverProfile?.homeZone || 'New Site'
  );
  const [seats, setSeats] = useState<number>(currentDriverProfile?.seats || 4);
  const [supportsAccessible, setSupportsAccessible] = useState<boolean>(
    currentDriverProfile?.supportsAccessible || false
  );

  const [error, setError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setPhone(currentUser.phone);
    setEmail(currentUser.email);
    setStudentOrStaffId(currentUser.studentOrStaffId);
    setHallOrDepartment(currentUser.hallOrDepartment);
  }, [currentUser]);

  useEffect(() => {
    if (!currentDriverProfile) return;
    setVehicleModel(currentDriverProfile.vehicleModel);
    setVehicleColor(currentDriverProfile.vehicleColor);
    setPlateNumber(currentDriverProfile.plateNumber);
    setLicenseNumber(currentDriverProfile.licenseNumber);
    setHomeZone(currentDriverProfile.homeZone);
    setSeats(currentDriverProfile.seats);
    setSupportsAccessible(currentDriverProfile.supportsAccessible);
  }, [currentDriverProfile]);

  if (!currentUser) return null;

  const isDriver = currentUser.role === 'driver';
  const isAdmin = currentUser.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSavedNotice(false);

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    const normalizedPhone = normalizeGhanaPhone(phone);
    if (!normalizedPhone) {
      setError(
        'Enter a valid Ghana +233 phone number (e.g. +233 24 519 8832).'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    if (studentOrStaffId.trim().length < 3) {
      setError('Please enter your UCC ID.');
      return;
    }

    if (isDriver) {
      if (vehicleModel.trim().length < 3 || plateNumber.trim().length < 5) {
        setError('Provide a valid vehicle model and Ghana plate number.');
        return;
      }
      if (licenseNumber.trim().length < 5) {
        setError('Provide a valid DVLA license number.');
        return;
      }
    }

    const res = updateProfile({
      name,
      phone: normalizedPhone,
      email,
      studentOrStaffId,
      hallOrDepartment,
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,
      homeZone,
      seats,
      supportsAccessible,
    });

    if (!res.ok) {
      setError(res.error || 'Could not update profile.');
      return;
    }

    setPhone(normalizedPhone);
    setSavedNotice(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#142B4A]">
          {isDriver
            ? 'Driver Profile & Vehicle Credentials'
            : isAdmin
              ? 'Administrator Staff Profile'
              : 'Passenger Profile'}
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          {isDriver
            ? 'Manage your contact details, vehicle registration, and view Admin verification status.'
            : isAdmin
              ? 'View your UCC Transport Directorate staff credentials and update contact info.'
              : 'Update your student details and Ghanaian +233 contact number for campus pickups.'}
        </p>
      </div>

      {/* Identity Summary Header Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <DriverAvatar
            name={currentUser.name}
            avatarUrl={currentDriverProfile?.avatarUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-[#142B4A]">
                {currentUser.name}
              </h2>
              <StatusBadge variant={currentUser.status} />
              {isDriver && currentDriverProfile && (
                <StatusBadge variant={currentDriverProfile.verificationStatus} />
              )}
            </div>
            <div className="text-xs text-[#64748B] mt-1 tabular-nums">
              {currentUser.studentOrStaffId} · {currentUser.hallOrDepartment}
            </div>
            <div className="text-xs text-[#64748B] mt-0.5 tabular-nums">
              Joined {currentUser.joinedAt}
            </div>
          </div>
        </div>

        <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#142B4A] bg-[#F2F4F6] px-3 py-1.5 rounded-lg">
          {currentUser.role} Account
        </span>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm p-5 sm:p-6 space-y-6"
      >
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-semibold text-[#93000A]"
          >
            {error}
          </div>
        )}

        {savedNotice && (
          <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-xs font-semibold text-[#15803D] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Your CampusRide profile changes have been saved.</span>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A] mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Ghana Phone (+233)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                {currentUser.role === 'passenger'
                  ? 'UCC Student ID'
                  : isDriver
                    ? 'Driver Union ID'
                    : 'UCC Staff ID'}
              </label>
              <input
                type="text"
                value={studentOrStaffId}
                readOnly={isAdmin}
                onChange={(e) => setStudentOrStaffId(e.target.value)}
                className={`w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm tabular-nums ${
                  isAdmin ? 'bg-[#F8F9FB] text-[#64748B]' : 'bg-white text-[#202938]'
                }`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#202938] mb-1">
                {currentUser.role === 'passenger'
                  ? 'Hall of Residence & Department'
                  : isDriver
                    ? 'Taxi Union Branch / Rank'
                    : 'Administrative Unit'}
              </label>
              <input
                type="text"
                value={hallOrDepartment}
                readOnly={isAdmin}
                onChange={(e) => setHallOrDepartment(e.target.value)}
                className={`w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm ${
                  isAdmin ? 'bg-[#F8F9FB] text-[#64748B]' : 'bg-white text-[#202938]'
                }`}
              />
            </div>
          </div>
        </div>

        {isDriver && currentDriverProfile && (
          <div className="pt-4 border-t border-[#F1F5F9]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-[#142B4A]">
                Vehicle & Licensing Details
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-[#142B4A]" />
                Status:{' '}
                <strong className="capitalize text-[#202938]">
                  {currentDriverProfile.verificationStatus}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  Vehicle Color
                </label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  Ghana License Plate
                </label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  DVLA License Number
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm text-[#202938] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  Stationed UCC Zone
                </label>
                <select
                  value={homeZone}
                  onChange={(e) => setHomeZone(e.target.value as CampusZone)}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm bg-white text-[#202938]"
                >
                  <option value="New Site">New Site</option>
                  <option value="Old Site">Old Site</option>
                  <option value="Central Academic">Central Academic</option>
                  <option value="Hostel Corridor">Hostel Corridor</option>
                  <option value="Highway Gate">Highway Gate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202938] mb-1">
                  Passenger Seat Capacity
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-lg border border-[#CBD5E1] text-sm bg-white text-[#202938]"
                >
                  {[3, 4, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} Seats
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#202938] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supportsAccessible}
                    onChange={(e) => setSupportsAccessible(e.target.checked)}
                    className="w-4 h-4 rounded border-[#94A3B8] accent-[#142B4A]"
                  />
                  <span>
                    Supports Accessible / Group Campus Pickups
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="h-11 px-6 rounded-lg bg-[#142B4A] hover:bg-[#1E3A5F] text-white text-sm font-semibold cursor-pointer"
          >
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
};
