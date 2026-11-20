import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  Car,
  Check,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { useCampusRide } from '../context/CampusRideContext';
import {
  HERO_TAXI_IMAGE,
  RIDE_TIERS,
  UCC_LOCATIONS,
  calculateEstimatedFare,
  formatGhs,
  normalizeGhanaPhone,
} from '../data/uccData';
import { RideRequest, RideTier } from '../types/campus';
import { CampusMapSchematic } from '../components/CampusMapSchematic';
import { DriverAvatar } from '../components/DriverAvatar';
import { StatusBadge } from '../components/StatusBadge';

export const PassengerExplorePage: React.FC = () => {
  const {
    activePassenger,
    drivers,
    rides,
    createRideRequest,
  } = useCampusRide();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramTier = searchParams.get('tier') as RideTier | null;
  const initialTier: RideTier =
    paramTier && ['shared', 'charter', 'accessible'].includes(paramTier)
      ? paramTier
      : 'shared';

  const [pickupId, setPickupId] = useState(
    searchParams.get('pickup') || 'valco'
  );
  const [dropoffId, setDropoffId] = useState(
    searchParams.get('dropoff') || 'library'
  );
  const [tier, setTier] = useState<RideTier>(initialTier);
  const [passengersCount, setPassengersCount] = useState(1);
  const [passengerName, setPassengerName] = useState(activePassenger.name);
  const [passengerPhone, setPassengerPhone] = useState(activePassenger.phone);
  const [pickupNote, setPickupNote] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<RideRequest['paymentMethod']>('Cash on Arrival');
  const [preferredDriverId, setPreferredDriverId] = useState<string>(
    searchParams.get('driverId') || ''
  );
  const [mapSelectMode, setMapSelectMode] = useState<'pickup' | 'dropoff'>(
    'dropoff'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPassengerName(activePassenger.name);
    setPassengerPhone(activePassenger.phone);
  }, [activePassenger]);

  useEffect(() => {
    const p = searchParams.get('pickup');
    const d = searchParams.get('dropoff');
    const t = searchParams.get('tier') as RideTier | null;
    const drv = searchParams.get('driverId');

    if (p && UCC_LOCATIONS.some((loc) => loc.id === p)) {
      setPickupId(p);
    }
    if (d && UCC_LOCATIONS.some((loc) => loc.id === d)) {
      setDropoffId(d);
    }
    if (t && ['shared', 'charter', 'accessible'].includes(t)) {
      setTier(t);
    }
    if (drv) {
      setPreferredDriverId(drv);
    }
  }, [searchParams]);

  useEffect(() => {
    const maxSeats = RIDE_TIERS[tier].maxPassengers;
    if (passengersCount > maxSeats) {
      setPassengersCount(maxSeats);
    }
  }, [tier, passengersCount]);

  const activeRide = rides.find(
    (r) =>
      r.passengerId === activePassenger.id &&
      !['completed', 'cancelled'].includes(r.status)
  );

  const verifiedAvailableDrivers = useMemo(
    () =>
      drivers.filter(
        (d) =>
          d.verificationStatus === 'verified' &&
          d.isAvailable &&
          (tier !== 'accessible' || d.supportsAccessible)
      ),
    [drivers, tier]
  );

  useEffect(() => {
    if (
      preferredDriverId &&
      !verifiedAvailableDrivers.some((d) => d.id === preferredDriverId)
    ) {
      setPreferredDriverId('');
    }
  }, [preferredDriverId, verifiedAvailableDrivers]);

  const estimate = useMemo(
    () => calculateEstimatedFare(pickupId, dropoffId, tier, passengersCount),
    [pickupId, dropoffId, tier, passengersCount]
  );

  const handleSwapLocations = () => {
    setPickupId(dropoffId);
    setDropoffId(pickupId);
    setErrors((prev) => ({ ...prev, route: '' }));
  };

  const handleMapNodeSelect = (locationId: string) => {
    if (mapSelectMode === 'pickup') {
      setPickupId(locationId);
      setMapSelectMode('dropoff');
    } else {
      setDropoffId(locationId);
    }
    setErrors((prev) => ({ ...prev, route: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!pickupId || !dropoffId) {
      nextErrors.route = 'Please select both a pickup and drop-off campus location.';
    } else if (pickupId === dropoffId) {
      nextErrors.route = 'Pickup and drop-off locations must be different.';
    }

    if (passengerName.trim().length < 2) {
      nextErrors.passengerName = 'Enter passenger full name.';
    }

    const normalizedPhone = normalizeGhanaPhone(passengerPhone);
    if (!normalizedPhone) {
      nextErrors.passengerPhone =
        'Enter a valid Ghana +233 number (e.g. +233 24 519 8832 or 0245198832).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    createRideRequest({
      passengerName,
      passengerPhone: normalizedPhone!,
      pickupLocationId: pickupId,
      dropoffLocationId: dropoffId,
      tier,
      passengersCount,
      pickupNote,
      preferredDriverId: preferredDriverId || null,
      paymentMethod,
    });

    navigate('/passenger/track');
  };

  const pickupLoc = UCC_LOCATIONS.find((l) => l.id === pickupId);
  const dropoffLoc = UCC_LOCATIONS.find((l) => l.id === dropoffId);

  return (
    <div className="space-y-6">
      {/* Active Ride Notice Banner */}
      {activeRide && (
        <div className="bg-[#142B4A] text-white rounded-2xl p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 shadow-campus-md">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#FF8A34]" />
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-sm font-semibold">
                  Active Trip {activeRide.id}
                </span>
                <StatusBadge variant={activeRide.status} />
              </div>
              <p className="text-xs text-[#D5E3FF] mt-0.5">
                {UCC_LOCATIONS.find((l) => l.id === activeRide.pickupLocationId)?.name}{' '}
                to{' '}
                {UCC_LOCATIONS.find((l) => l.id === activeRide.dropoffLocationId)?.name}{' '}
                · <span className="tabular-nums font-semibold">{formatGhs(activeRide.fareGhs)}</span>
              </p>
            </div>
          </div>
          <Link
            to="/passenger/track"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <span>Track Active Ride</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Hero Header Strip */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#984800]">
                University of Cape Coast · Campus Transit
              </span>
              <Link
                to="/passenger/profile"
                className="text-xs font-semibold text-[#142B4A] bg-[#F2F4F6] hover:bg-[#E6E8EA] border border-[#CBD5E1] rounded-md px-2.5 py-1.5 transition-colors tabular-nums"
              >
                {activePassenger.name} · {activePassenger.studentOrStaffId}
              </Link>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#142B4A] leading-tight">
              Safe, vetted taxi pickups across Old Site, New Site & Hostels
            </h1>
            <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
              Request verified UCC union drivers with transparent GH₵ zone estimates. Pay directly via cash or Mobile Money upon arrival.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#F1F5F9]">
            <div>
              <div className="text-xs text-[#64748B]">Verified Drivers</div>
              <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                {drivers.filter((d) => d.verificationStatus === 'verified').length} Active
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">Campus Zones</div>
              <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                {UCC_LOCATIONS.length} Stops
              </div>
            </div>
            <div>
              <div className="text-xs text-[#64748B]">Base Campus Fare</div>
              <div className="text-lg font-bold text-[#142B4A] tabular-nums">
                From GH₵ 9.00
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full bg-[#142B4A]">
          <img
            src={HERO_TAXI_IMAGE}
            alt="UCC CampusRide official silver and navy taxi sedan parked on campus boulevard"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001632]/75 via-transparent to-transparent flex items-end p-5">
            <div className="text-white">
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#FFB689]">
                UCC Campus Dispatch Demo
              </div>
              <div className="text-sm font-semibold mt-0.5">
                Valco · Casford · Sam Jonah Library · Amamoma
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Booking + Schematic Map Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Booking Form Sheet */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-md p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#142B4A]">
              Book a Campus Ride
            </h2>
            <button
              type="button"
              onClick={handleSwapLocations}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#142B4A] hover:text-[#FF8A34] px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-[#F8F9FB] cursor-pointer transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          </div>

          {/* Paired Pickup / Drop-off Selector with Stitch Anchor Nodes */}
          <div className="relative pl-7 space-y-3">
            {/* Vertical dashed stroke joining Green Pickup node & Orange Drop-off pin */}
            <div
              aria-hidden="true"
              className="absolute left-[10px] top-6 bottom-6 w-px border-l-2 border-dashed border-[#94A3B8]"
            />

            {/* Pickup Input */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[25px] top-9 w-3.5 h-3.5 rounded-full border-[3px] border-[#22A06B] bg-white"
              />
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="pickup-select"
                  className="text-xs font-semibold text-[#202938]"
                >
                  Pickup Point
                </label>
                <button
                  type="button"
                  onClick={() => setMapSelectMode('pickup')}
                  className={`text-[11px] font-semibold cursor-pointer ${
                    mapSelectMode === 'pickup'
                      ? 'text-[#22A06B] underline'
                      : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {mapSelectMode === 'pickup' ? 'Clicking map sets Pickup' : 'Pick on map'}
                </button>
              </div>
              <select
                id="pickup-select"
                value={pickupId}
                onChange={(e) => {
                  setPickupId(e.target.value);
                  setErrors((prev) => ({ ...prev, route: '' }));
                }}
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm font-medium text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-[#142B4A]"
              >
                {UCC_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Drop-off Input */}
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[25px] top-9 w-3.5 h-3.5 rounded-full bg-[#FF8A34]"
              />
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="dropoff-select"
                  className="text-xs font-semibold text-[#202938]"
                >
                  Campus Drop-off
                </label>
                <button
                  type="button"
                  onClick={() => setMapSelectMode('dropoff')}
                  className={`text-[11px] font-semibold cursor-pointer ${
                    mapSelectMode === 'dropoff'
                      ? 'text-[#984800] underline'
                      : 'text-[#64748B] hover:text-[#142B4A]'
                  }`}
                >
                  {mapSelectMode === 'dropoff' ? 'Clicking map sets Drop-off' : 'Pick on map'}
                </button>
              </div>
              <select
                id="dropoff-select"
                value={dropoffId}
                onChange={(e) => {
                  setDropoffId(e.target.value);
                  setErrors((prev) => ({ ...prev, route: '' }));
                }}
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm font-medium text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A] focus:border-[#142B4A]"
              >
                {UCC_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.route && (
            <p className="text-xs font-medium text-[#E11D48] bg-[#FFE4E6] px-3 py-2 rounded-lg">
              {errors.route}
            </p>
          )}

          {/* Ride Tier Radio Selection */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#202938]">
              Select Ride Class
            </span>
            <div className="space-y-2">
              {(Object.keys(RIDE_TIERS) as RideTier[]).map((tierKey) => {
                const info = RIDE_TIERS[tierKey];
                const tierEstimate = calculateEstimatedFare(
                  pickupId,
                  dropoffId,
                  tierKey,
                  passengersCount
                );
                const selected = tier === tierKey;

                return (
                  <label
                    key={tierKey}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selected
                        ? 'border-[#142B4A] bg-[#F8FAFC] ring-1 ring-[#142B4A]'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name="rideTier"
                        value={tierKey}
                        checked={selected}
                        onChange={() => setTier(tierKey)}
                        className="sr-only"
                      />
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selected ? 'border-[#142B4A]' : 'border-[#CBD5E1]'
                        }`}
                      >
                        {selected && (
                          <span className="w-2 h-2 rounded-full bg-[#142B4A]" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#202938]">
                          {info.label}
                        </div>
                        <div className="text-xs text-[#64748B] truncate">
                          {info.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#142B4A] tabular-nums whitespace-nowrap shrink-0">
                      {tierEstimate.fareGhs > 0
                        ? formatGhs(tierEstimate.fareGhs)
                        : '—'}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Passenger Details & Ghana Phone Validation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="passenger-name"
                className="block text-xs font-semibold text-[#202938] mb-1"
              >
                Passenger Name
              </label>
              <input
                id="passenger-name"
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Akosua Darko"
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
              {errors.passengerName && (
                <p className="text-[11px] text-[#E11D48] mt-1">
                  {errors.passengerName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="passenger-phone"
                className="block text-xs font-semibold text-[#202938] mb-1"
              >
                Ghana Phone (+233)
              </label>
              <input
                id="passenger-phone"
                type="tel"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="+233 24 519 8832"
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              />
              {errors.passengerPhone && (
                <p className="text-[11px] text-[#E11D48] mt-1">
                  {errors.passengerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Seats, Preferred Driver & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="seats-select"
                className="block text-xs font-semibold text-[#202938] mb-1"
              >
                Seats Needed
              </label>
              <select
                id="seats-select"
                value={passengersCount}
                onChange={(e) => setPassengersCount(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option
                    key={num}
                    value={num}
                    disabled={num > RIDE_TIERS[tier].maxPassengers}
                  >
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="payment-select"
                className="block text-xs font-semibold text-[#202938] mb-1"
              >
                Direct Payment on Arrival
              </label>
              <select
                id="payment-select"
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as RideRequest['paymentMethod']
                  )
                }
                className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
              >
                <option value="Cash on Arrival">Cash on Arrival</option>
                <option value="MTN MoMo (Driver Direct)">
                  MTN MoMo (Driver Direct)
                </option>
                <option value="Telecel Cash (Driver Direct)">
                  Telecel Cash (Driver Direct)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="driver-pref-select"
              className="block text-xs font-semibold text-[#202938] mb-1"
            >
              Driver Assignment
            </label>
            <select
              id="driver-pref-select"
              value={preferredDriverId}
              onChange={(e) => setPreferredDriverId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
            >
              <option value="">
                Broadcast to Campus Queue (Fastest Available)
              </option>
              {verifiedAvailableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.plateNumber} ({d.homeZone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="pickup-note"
              className="block text-xs font-semibold text-[#202938] mb-1"
            >
              Pickup Landmark Note (Optional)
            </label>
            <input
              id="pickup-note"
              type="text"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
              placeholder={
                pickupLoc
                  ? `e.g. Waiting near ${pickupLoc.landmarkHint}`
                  : 'e.g. Standing by main entrance'
              }
              className="w-full h-11 px-3 rounded-lg bg-white border border-[#CBD5E1] text-sm text-[#202938] focus:outline-none focus:ring-2 focus:ring-[#142B4A]"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              className="w-full h-12 rounded-lg bg-[#FF8A34] hover:bg-[#E57523] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-campus-sm transition-all cursor-pointer"
            >
              <span>Book Campus Ride</span>
              {estimate.fareGhs > 0 && (
                <span className="tabular-nums font-bold">
                  · {formatGhs(estimate.fareGhs)}
                </span>
              )}
            </button>
            <p className="text-[11px] text-[#64748B] text-center">
              Demo booking: fare is paid directly to driver in cash or MoMo upon arrival.
            </p>
          </div>
        </form>

        {/* Right Column: Schematic Map + Matching Available Drivers */}
        <div className="lg:col-span-7 space-y-6">
          <CampusMapSchematic
            pickupId={pickupId}
            dropoffId={dropoffId}
            interactiveMode={mapSelectMode}
            onSelectLocation={handleMapNodeSelect}
          />

          {/* Route Summary Strip */}
          {pickupLoc && dropoffLoc && pickupLoc.id !== dropoffLoc.id && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-campus-sm p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="w-4 h-4 text-[#FF8A34] shrink-0" />
                <div className="text-sm font-semibold text-[#142B4A] truncate">
                  {pickupLoc.shortName} → {dropoffLoc.shortName}
                </div>
              </div>
              <div className="flex items-center gap-5 text-xs text-[#64748B] tabular-nums">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#142B4A]" />
                  Est. {estimate.estDurationMins} mins
                </span>
                <span>~{estimate.distanceKm.toFixed(1)} km</span>
                <span className="text-sm font-bold text-[#142B4A]">
                  {formatGhs(estimate.fareGhs)}
                </span>
              </div>
            </div>
          )}

          {/* Available Verified Drivers List */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#142B4A]">
                  Available Verified Drivers (Demo Queue)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Select a driver to assign directly, or broadcast to the queue.
                </p>
              </div>
              <Link
                to="/passenger/drivers"
                className="text-xs font-semibold text-[#142B4A] hover:text-[#FF8A34] whitespace-nowrap"
              >
                View all drivers
              </Link>
            </div>

            {verifiedAvailableDrivers.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-sm font-medium text-[#202938]">
                  No drivers currently marked available for this filter.
                </p>
                <p className="text-xs text-[#64748B]">
                  You can still submit to the open campus dispatch queue or switch to the Driver role to mark a driver available.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {verifiedAvailableDrivers.map((driver) => {
                  const isChosen = preferredDriverId === driver.id;
                  return (
                    <div
                      key={driver.id}
                      onClick={() =>
                        setPreferredDriverId(isChosen ? '' : driver.id)
                      }
                      className={`p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer transition-colors ${
                        isChosen ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <DriverAvatar
                          name={driver.name}
                          avatarUrl={driver.avatarUrl}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-[#202938]">
                              {driver.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D]">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              UCC Verified
                            </span>
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5 truncate">
                            {driver.vehicleModel} ·{' '}
                            <span className="font-semibold text-[#202938] tabular-nums">
                              {driver.plateNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B] tabular-nums">
                            <span className="inline-flex items-center gap-1 text-[#202938] font-semibold">
                              <Star className="w-3 h-3 fill-[#FF8A34] text-[#FF8A34]" />
                              {driver.rating.toFixed(1)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {driver.seats} seats
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {driver.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 ml-auto shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#142B4A] tabular-nums">
                            ~{driver.estimatedPickupMins} min
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {driver.homeZone}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreferredDriverId(isChosen ? '' : driver.id);
                          }}
                          className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isChosen
                              ? 'bg-[#142B4A] text-white'
                              : 'bg-white border border-[#CBD5E1] text-[#142B4A] hover:bg-[#F2F4F6]'
                          }`}
                        >
                          {isChosen && <Check className="w-3.5 h-3.5" />}
                          <span>{isChosen ? 'Selected' : 'Select'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
