export type UserRole = 'passenger' | 'driver' | 'admin';

export type CampusZone =
  | 'New Site'
  | 'Old Site'
  | 'Central Academic'
  | 'Hostel Corridor'
  | 'Highway Gate';

export interface CampusLocation {
  id: string;
  name: string;
  shortName: string;
  zone: CampusZone;
  landmarkHint: string;
  x: number; // SVG schematic coordinate (0-1000)
  y: number; // SVG schematic coordinate (0-520)
}

export type RideTier = 'shared' | 'charter' | 'accessible';

export type RideStatus =
  | 'requested'
  | 'accepted'
  | 'en_route'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type VerificationStatus = 'verified' | 'pending' | 'suspended';

export type UserStatus = 'active' | 'suspended';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  password: string;
  studentOrStaffId: string;
  hallOrDepartment: string;
  status: UserStatus;
  joinedAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  avatarUrl: string;
  vehicleModel: string;
  vehicleColor: string;
  plateNumber: string;
  seats: number;
  supportsAccessible: boolean;
  homeZone: CampusZone;
  rating: number;
  completedTrips: number;
  verificationStatus: VerificationStatus;
  isAvailable: boolean; // Demonstration availability flag stored locally
  licenseNumber: string;
  estimatedPickupMins: number;
}

export interface RideRequest {
  id: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string | null;
  pickupLocationId: string;
  dropoffLocationId: string;
  tier: RideTier;
  passengersCount: number;
  pickupNote: string;
  fareGhs: number;
  paymentMethod: 'Cash on Arrival' | 'MTN MoMo (Driver Direct)' | 'Telecel Cash (Driver Direct)';
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
  declinedByDriverIds: string[];
  cancelledBy?: UserRole;
  cancelReason?: string;
}
