import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CampusZone,
  DriverProfile,
  RideRequest,
  RideStatus,
  RideTier,
  UserAccount,
  UserRole,
} from '../types/campus';
import {
  INITIAL_DRIVERS,
  INITIAL_RIDES,
  INITIAL_USERS,
  calculateEstimatedFare,
} from '../data/uccData';

const STORAGE_KEY = 'campusride_ucc_state_v1';

interface StoredState {
  currentUserId: string | null;
  activeRole: UserRole;
  activePassengerId: string;
  activeDriverId: string;
  users: UserAccount[];
  drivers: DriverProfile[];
  rides: RideRequest[];
}

export interface ToastMessage {
  id: string;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface CreateRideInput {
  passengerName: string;
  passengerPhone: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  tier: RideTier;
  passengersCount: number;
  pickupNote: string;
  preferredDriverId: string | null;
  paymentMethod: RideRequest['paymentMethod'];
}

interface AddUserInput {
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  password?: string;
  studentOrStaffId: string;
  hallOrDepartment: string;
  vehicleModel?: string;
  plateNumber?: string;
  licenseNumber?: string;
  homeZone?: CampusZone;
}

export interface RegisterUserInput {
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  password: string;
  studentOrStaffId: string;
  hallOrDepartment: string;
  vehicleModel?: string;
  vehicleColor?: string;
  plateNumber?: string;
  licenseNumber?: string;
  homeZone?: CampusZone;
  seats?: number;
  supportsAccessible?: boolean;
}

export interface UpdateProfileInput {
  name: string;
  phone: string;
  email: string;
  studentOrStaffId: string;
  hallOrDepartment: string;
  vehicleModel?: string;
  vehicleColor?: string;
  plateNumber?: string;
  licenseNumber?: string;
  homeZone?: CampusZone;
  seats?: number;
  supportsAccessible?: boolean;
}

interface CampusRideContextValue {
  currentUser: UserAccount | null;
  currentDriverProfile: DriverProfile | null;
  activeRole: UserRole;
  activePassengerId: string;
  activeDriverId: string;
  activePassenger: UserAccount;
  activeDriver: DriverProfile;
  users: UserAccount[];
  drivers: DriverProfile[];
  rides: RideRequest[];
  toast: ToastMessage | null;
  dismissToast: () => void;
  loginUser: (
    identifier: string,
    password: string,
    expectedRole?: UserRole
  ) => { ok: boolean; error?: string; user?: UserAccount };
  registerUser: (
    input: RegisterUserInput
  ) => { ok: boolean; error?: string; user?: UserAccount };
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => { ok: boolean; error?: string };
  setActiveRole: (role: UserRole) => void;
  setActivePassengerId: (id: string) => void;
  setActiveDriverId: (id: string) => void;
  createRideRequest: (input: CreateRideInput) => RideRequest;
  cancelRide: (rideId: string, byRole: UserRole, reason?: string) => void;
  toggleDriverAvailability: (driverId: string) => void;
  acceptRideRequest: (rideId: string, driverId: string) => void;
  declineRideRequest: (rideId: string, driverId: string) => void;
  advanceRideStatus: (rideId: string, nextStatus: RideStatus) => void;
  verifyDriver: (driverId: string) => void;
  suspendDriver: (driverId: string) => void;
  restoreDriver: (driverId: string) => void;
  toggleUserStatus: (userId: string) => void;
  addDemoUser: (input: AddUserInput) => void;
  adminReassignDriver: (rideId: string, driverId: string) => void;
  resetDemoData: () => void;
}

const defaultState: StoredState = {
  currentUserId: null,
  activeRole: 'passenger',
  activePassengerId: 'usr-student-1',
  activeDriverId: 'drv-1',
  users: INITIAL_USERS,
  drivers: INITIAL_DRIVERS,
  rides: INITIAL_RIDES,
};

function loadInitialState(): StoredState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (!parsed.users || !parsed.drivers || !parsed.rides) return defaultState;

    const hydratedUsers = parsed.users.map((u) => ({
      ...u,
      password: u.password || 'password123',
    }));

    return {
      currentUserId:
        parsed.currentUserId !== undefined ? parsed.currentUserId : null,
      activeRole: parsed.activeRole || 'passenger',
      activePassengerId: parsed.activePassengerId || INITIAL_USERS[0].id,
      activeDriverId: parsed.activeDriverId || INITIAL_DRIVERS[0].id,
      users: hydratedUsers,
      drivers: parsed.drivers,
      rides: parsed.rides,
    };
  } catch {
    return defaultState;
  }
}

const CampusRideContext = createContext<CampusRideContextValue | null>(null);

export const CampusRideProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<StoredState>(loadInitialState);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, tone: ToastMessage['tone'] = 'info') => {
    setToast({ id: String(Date.now()), message, tone });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as StoredState;
          setState(parsed);
        } catch {
          // Ignore malformed storage payload
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const currentUser =
    state.currentUserId
      ? state.users.find((u) => u.id === state.currentUserId) || null
      : null;

  const currentDriverProfile =
    currentUser && currentUser.role === 'driver'
      ? state.drivers.find((d) => d.userId === currentUser.id) || null
      : null;

  const activePassenger =
    (currentUser?.role === 'passenger' ? currentUser : null) ||
    state.users.find((u) => u.id === state.activePassengerId) ||
    state.users.find((u) => u.role === 'passenger') ||
    state.users[0];

  const activeDriver =
    currentDriverProfile ||
    state.drivers.find((d) => d.id === state.activeDriverId) ||
    state.drivers[0];

  const loginUser = (
    identifier: string,
    password: string,
    expectedRole?: UserRole
  ): { ok: boolean; error?: string; user?: UserAccount } => {
    const cleanId = identifier.trim().toLowerCase();
    const matched = state.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.studentOrStaffId.toLowerCase() === cleanId
    );

    if (!matched) {
      return {
        ok: false,
        error: 'No CampusRide account found for that email or UCC ID.',
      };
    }

    if (matched.password !== password) {
      return {
        ok: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    if (expectedRole && matched.role !== expectedRole) {
      return {
        ok: false,
        error: `This account is registered as a ${matched.role}. Please sign in under the ${matched.role} role tab.`,
      };
    }

    if (matched.status === 'suspended') {
      return {
        ok: false,
        error: 'This account has been suspended by CampusRide Admin.',
      };
    }

    const linkedDriver =
      matched.role === 'driver'
        ? state.drivers.find((d) => d.userId === matched.id)
        : undefined;

    setState((prev) => ({
      ...prev,
      currentUserId: matched.id,
      activeRole: matched.role,
      activePassengerId:
        matched.role === 'passenger' ? matched.id : prev.activePassengerId,
      activeDriverId: linkedDriver ? linkedDriver.id : prev.activeDriverId,
    }));

    showToast(`Welcome back, ${matched.name}.`, 'success');
    return { ok: true, user: matched };
  };

  const registerUser = (
    input: RegisterUserInput
  ): { ok: boolean; error?: string; user?: UserAccount } => {
    if (input.role === 'admin') {
      return {
        ok: false,
        error:
          'Administrator accounts cannot be publicly registered. Sign in with an authorized staff account.',
      };
    }

    const cleanEmail = input.email.trim().toLowerCase();
    const emailTaken = state.users.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (emailTaken) {
      return {
        ok: false,
        error: 'An account with this email address already exists.',
      };
    }

    const newUserId = `usr-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    const newUser: UserAccount = {
      id: newUserId,
      name: input.name.trim(),
      role: input.role,
      phone: input.phone.trim(),
      email: input.email.trim(),
      password: input.password,
      studentOrStaffId: input.studentOrStaffId.trim().toUpperCase(),
      hallOrDepartment: input.hallOrDepartment.trim(),
      status: 'active',
      joinedAt: today,
    };

    let newDriverId: string | null = null;
    const nextDrivers = [...state.drivers];

    if (input.role === 'driver') {
      newDriverId = `drv-${Date.now()}`;
      nextDrivers.unshift({
        id: newDriverId,
        userId: newUserId,
        name: newUser.name,
        phone: newUser.phone,
        avatarUrl: '',
        vehicleModel: input.vehicleModel?.trim() || 'Toyota Corolla (Sedan)',
        vehicleColor: input.vehicleColor?.trim() || 'Silver',
        plateNumber:
          input.plateNumber?.trim().toUpperCase() || 'CR 5402-25',
        seats: input.seats || 4,
        supportsAccessible: Boolean(input.supportsAccessible),
        homeZone: input.homeZone || 'New Site',
        rating: 5.0,
        completedTrips: 0,
        verificationStatus: 'pending',
        isAvailable: false,
        licenseNumber:
          input.licenseNumber?.trim().toUpperCase() || 'DVLA-CR-61204',
        estimatedPickupMins: 5,
      });
    }

    setState((prev) => ({
      ...prev,
      currentUserId: newUserId,
      activeRole: input.role,
      activePassengerId:
        input.role === 'passenger' ? newUserId : prev.activePassengerId,
      activeDriverId: newDriverId || prev.activeDriverId,
      users: [newUser, ...prev.users],
      drivers: nextDrivers,
    }));

    showToast(
      input.role === 'driver'
        ? `Account created for ${newUser.name}. Pending Admin verification before going online.`
        : `Welcome to CampusRide, ${newUser.name}!`,
      'success'
    );

    return { ok: true, user: newUser };
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      currentUserId: null,
    }));
    showToast('Signed out of CampusRide.', 'info');
  };

  const updateProfile = (
    input: UpdateProfileInput
  ): { ok: boolean; error?: string } => {
    if (!currentUser) {
      return { ok: false, error: 'You must be signed in to update profile.' };
    }

    const emailConflict = state.users.some(
      (u) =>
        u.id !== currentUser.id &&
        u.email.toLowerCase() === input.email.trim().toLowerCase()
    );
    if (emailConflict) {
      return {
        ok: false,
        error: 'That email address is already used by another account.',
      };
    }

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              name: input.name.trim(),
              phone: input.phone.trim(),
              email: input.email.trim(),
              studentOrStaffId: input.studentOrStaffId.trim(),
              hallOrDepartment: input.hallOrDepartment.trim(),
            }
          : u
      ),
      drivers:
        currentUser.role === 'driver'
          ? prev.drivers.map((d) =>
              d.userId === currentUser.id
                ? {
                    ...d,
                    name: input.name.trim(),
                    phone: input.phone.trim(),
                    vehicleModel: input.vehicleModel?.trim() || d.vehicleModel,
                    vehicleColor: input.vehicleColor?.trim() || d.vehicleColor,
                    plateNumber:
                      input.plateNumber?.trim().toUpperCase() || d.plateNumber,
                    licenseNumber:
                      input.licenseNumber?.trim().toUpperCase() ||
                      d.licenseNumber,
                    homeZone: input.homeZone || d.homeZone,
                    seats: input.seats || d.seats,
                    supportsAccessible:
                      input.supportsAccessible ?? d.supportsAccessible,
                  }
                : d
            )
          : prev.drivers,
    }));

    showToast('Profile details saved.', 'success');
    return { ok: true };
  };

  const setActiveRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, activeRole: role }));
  };

  const setActivePassengerId = (id: string) => {
    setState((prev) => ({ ...prev, activePassengerId: id }));
  };

  const setActiveDriverId = (id: string) => {
    setState((prev) => ({ ...prev, activeDriverId: id }));
  };

  const createRideRequest = (input: CreateRideInput): RideRequest => {
    const { fareGhs } = calculateEstimatedFare(
      input.pickupLocationId,
      input.dropoffLocationId,
      input.tier,
      input.passengersCount
    );

    const now = new Date().toISOString();
    const numericId = Math.floor(8500 + Math.random() * 1400);

    const selectedDriver = input.preferredDriverId
      ? state.drivers.find(
          (d) =>
            d.id === input.preferredDriverId &&
            d.verificationStatus === 'verified' &&
            d.isAvailable
        )
      : null;

    const newRide: RideRequest = {
      id: `RIDE-${numericId}`,
      passengerId: activePassenger.id,
      passengerName: input.passengerName.trim(),
      passengerPhone: input.passengerPhone.trim(),
      driverId: selectedDriver ? selectedDriver.id : null,
      pickupLocationId: input.pickupLocationId,
      dropoffLocationId: input.dropoffLocationId,
      tier: input.tier,
      passengersCount: input.passengersCount,
      pickupNote: input.pickupNote.trim(),
      fareGhs,
      paymentMethod: input.paymentMethod,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
      declinedByDriverIds: [],
    };

    setState((prev) => ({
      ...prev,
      rides: [newRide, ...prev.rides],
    }));

    showToast(
      selectedDriver
        ? `Ride ${newRide.id} requested with ${selectedDriver.name}.`
        : `Ride ${newRide.id} placed in campus dispatch queue.`,
      'success'
    );

    return newRide;
  };

  const cancelRide = (rideId: string, byRole: UserRole, reason?: string) => {
    const targetRide = state.rides.find((r) => r.id === rideId);
    if (!targetRide) return;

    if (['completed', 'cancelled'].includes(targetRide.status)) {
      showToast(`Ride ${rideId} is already ${targetRide.status}.`, 'error');
      return;
    }

    if (targetRide.status === 'in_progress' && byRole !== 'admin') {
      showToast(
        'Trips already in progress cannot be cancelled directly. Contact Campus Dispatch.',
        'error'
      );
      return;
    }

    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      rides: prev.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: 'cancelled',
              updatedAt: now,
              cancelledBy: byRole,
              cancelReason: reason || `Cancelled by ${byRole}`,
            }
          : r
      ),
    }));
    showToast(`Ride ${rideId} has been cancelled.`, 'info');
  };

  const toggleDriverAvailability = (driverId: string) => {
    const target = state.drivers.find((d) => d.id === driverId);
    if (!target) return;
    const driverUser = state.users.find((u) => u.id === target.userId);

    if (
      target.verificationStatus !== 'verified' ||
      driverUser?.status === 'suspended'
    ) {
      showToast(
        'Driver must be active and verified by Admin before toggling availability.',
        'error'
      );
      return;
    }

    const nextAvailable = !target.isAvailable;
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) =>
        d.id === driverId ? { ...d, isAvailable: nextAvailable } : d
      ),
    }));
    showToast(
      `${target.name} is now ${nextAvailable ? 'Available' : 'Offline'} (demo queue).`,
      'info'
    );
  };

  const acceptRideRequest = (rideId: string, driverId: string) => {
    const driver = state.drivers.find((d) => d.id === driverId);
    const driverUser = driver
      ? state.users.find((u) => u.id === driver.userId)
      : undefined;

    if (
      !driver ||
      driver.verificationStatus !== 'verified' ||
      driverUser?.status === 'suspended'
    ) {
      showToast('Only active, verified drivers can accept ride requests.', 'error');
      return;
    }

    const hasActiveRide = state.rides.some(
      (r) =>
        r.driverId === driverId &&
        ['accepted', 'en_route', 'arrived', 'in_progress'].includes(r.status)
    );
    if (hasActiveRide) {
      showToast('Complete or cancel your current active trip first.', 'error');
      return;
    }

    const targetRide = state.rides.find((r) => r.id === rideId);
    if (
      !targetRide ||
      targetRide.status !== 'requested' ||
      (targetRide.driverId !== null && targetRide.driverId !== driverId)
    ) {
      showToast('This ride request is no longer available.', 'error');
      return;
    }

    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      rides: prev.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              driverId,
              status: 'accepted',
              updatedAt: now,
            }
          : r
      ),
    }));
    showToast(`Accepted ${rideId}. Proceed to pickup when ready.`, 'success');
  };

  const declineRideRequest = (rideId: string, driverId: string) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      rides: prev.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              driverId: r.driverId === driverId ? null : r.driverId,
              declinedByDriverIds: [...r.declinedByDriverIds, driverId],
              updatedAt: now,
            }
          : r
      ),
    }));
    showToast(`Declined ${rideId}. Returned to open campus queue.`, 'info');
  };

  const advanceRideStatus = (rideId: string, nextStatus: RideStatus) => {
    const targetRide = state.rides.find((r) => r.id === rideId);
    if (!targetRide) return;

    const validNextMap: Partial<Record<RideStatus, RideStatus>> = {
      accepted: 'en_route',
      en_route: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
    };

    if (validNextMap[targetRide.status] !== nextStatus) {
      showToast(
        `Invalid status transition from ${targetRide.status} to ${nextStatus}.`,
        'error'
      );
      return;
    }

    const now = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      rides: prev.rides.map((r) =>
        r.id === rideId ? { ...r, status: nextStatus, updatedAt: now } : r
      ),
      drivers:
        nextStatus === 'completed' && targetRide.driverId
          ? prev.drivers.map((d) =>
              d.id === targetRide.driverId
                ? { ...d, completedTrips: d.completedTrips + 1 }
                : d
            )
          : prev.drivers,
    }));

    const statusLabels: Record<RideStatus, string> = {
      requested: 'Requested',
      accepted: 'Accepted',
      en_route: 'En Route to Pickup',
      arrived: 'Arrived at Pickup',
      in_progress: 'Trip In Progress',
      completed: 'Trip Completed',
      cancelled: 'Cancelled',
    };
    showToast(`${rideId} updated to: ${statusLabels[nextStatus]}`, 'success');
  };

  const verifyDriver = (driverId: string) => {
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) =>
        d.id === driverId
          ? { ...d, verificationStatus: 'verified', isAvailable: true }
          : d
      ),
    }));
    showToast('Driver verified and enabled for campus dispatch.', 'success');
  };

  const suspendDriver = (driverId: string) => {
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) =>
        d.id === driverId
          ? { ...d, verificationStatus: 'suspended', isAvailable: false }
          : d
      ),
    }));
    showToast('Driver suspended from active dispatch.', 'info');
  };

  const restoreDriver = (driverId: string) => {
    setState((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) =>
        d.id === driverId ? { ...d, verificationStatus: 'verified' } : d
      ),
    }));
    showToast('Driver verification restored.', 'success');
  };

  const toggleUserStatus = (userId: string) => {
    const targetUser = state.users.find((u) => u.id === userId);
    if (!targetUser || targetUser.role === 'admin') return;
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';

    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === userId ? { ...u, status: nextStatus } : u
      ),
      drivers:
        targetUser.role === 'driver' && nextStatus === 'suspended'
          ? prev.drivers.map((d) =>
              d.userId === userId ? { ...d, isAvailable: false } : d
            )
          : prev.drivers,
    }));
    showToast(
      `${targetUser.name} account ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`,
      'info'
    );
  };

  const addDemoUser = (input: AddUserInput) => {
    const newUserId = `usr-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    const newUser: UserAccount = {
      id: newUserId,
      name: input.name.trim(),
      role: input.role,
      phone: input.phone.trim(),
      email: input.email.trim(),
      password: input.password || 'password123',
      studentOrStaffId: input.studentOrStaffId.trim(),
      hallOrDepartment: input.hallOrDepartment.trim(),
      status: 'active',
      joinedAt: today,
    };

    const newDrivers = [...state.drivers];
    if (input.role === 'driver') {
      newDrivers.unshift({
        id: `drv-${Date.now()}`,
        userId: newUserId,
        name: input.name.trim(),
        phone: input.phone.trim(),
        avatarUrl: '',
        vehicleModel:
          input.vehicleModel?.trim() || 'Toyota Corolla (Campus Taxi)',
        vehicleColor: 'Silver',
        plateNumber: input.plateNumber?.trim().toUpperCase() || 'CR 5120-25',
        seats: 4,
        supportsAccessible: false,
        homeZone: input.homeZone || 'New Site',
        rating: 5.0,
        completedTrips: 0,
        verificationStatus: 'pending',
        isAvailable: false,
        licenseNumber:
          input.licenseNumber?.trim().toUpperCase() || 'DVLA-CR-70122',
        estimatedPickupMins: 5,
      });
    }

    setState((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
      drivers: newDrivers,
    }));

    showToast(
      input.role === 'driver'
        ? `Added driver ${newUser.name} to verification queue.`
        : `Added ${newUser.role} ${newUser.name}.`,
      'success'
    );
  };

  const adminReassignDriver = (rideId: string, driverId: string) => {
    const driver = state.drivers.find((d) => d.id === driverId);
    const targetRide = state.rides.find((r) => r.id === rideId);
    if (!driver || !targetRide) return;

    if (driver.verificationStatus !== 'verified') {
      showToast('Only verified drivers can be assigned to rides.', 'error');
      return;
    }

    if (['completed', 'cancelled'].includes(targetRide.status)) {
      showToast('Cannot reassign a completed or cancelled ride.', 'error');
      return;
    }

    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      rides: prev.rides.map((r) =>
        r.id === rideId
          ? {
              ...r,
              driverId,
              status: r.status === 'requested' ? 'accepted' : r.status,
              updatedAt: now,
            }
          : r
      ),
    }));
    showToast(`Assigned ${driver.name} to ${rideId}.`, 'success');
  };

  const resetDemoData = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    showToast('Demonstration data reset to UCC defaults.', 'info');
  };

  return (
    <CampusRideContext.Provider
      value={{
        currentUser,
        currentDriverProfile,
        activeRole: state.activeRole,
        activePassengerId: state.activePassengerId,
        activeDriverId: state.activeDriverId,
        activePassenger,
        activeDriver,
        users: state.users,
        drivers: state.drivers,
        rides: state.rides,
        toast,
        dismissToast: () => setToast(null),
        loginUser,
        registerUser,
        logout,
        updateProfile,
        setActiveRole,
        setActivePassengerId,
        setActiveDriverId,
        createRideRequest,
        cancelRide,
        toggleDriverAvailability,
        acceptRideRequest,
        declineRideRequest,
        advanceRideStatus,
        verifyDriver,
        suspendDriver,
        restoreDriver,
        toggleUserStatus,
        addDemoUser,
        adminReassignDriver,
        resetDemoData,
      }}
    >
      {children}
    </CampusRideContext.Provider>
  );
};

export function useCampusRide() {
  const ctx = useContext(CampusRideContext);
  if (!ctx) {
    throw new Error('useCampusRide must be used within CampusRideProvider');
  }
  return ctx;
}
