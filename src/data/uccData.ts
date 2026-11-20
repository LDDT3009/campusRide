import {
  CampusLocation,
  DriverProfile,
  RideRequest,
  RideTier,
  UserAccount,
} from '../types/campus';

export const UCC_LOCATIONS: CampusLocation[] = [
  {
    id: 'valco',
    name: 'Valco Hall',
    shortName: 'Valco',
    zone: 'New Site',
    landmarkHint: 'Main Porter Lodge Forecourt',
    x: 240,
    y: 135,
  },
  {
    id: 'casford',
    name: 'Casely Hayford (Casford) Hall',
    shortName: 'Casford',
    zone: 'New Site',
    landmarkHint: 'Casford Roundabout Stop',
    x: 365,
    y: 110,
  },
  {
    id: 'nkrumah',
    name: 'Kwame Nkrumah Hall',
    shortName: 'KNH',
    zone: 'New Site',
    landmarkHint: 'KNH Shuttle Bay',
    x: 495,
    y: 135,
  },
  {
    id: 'science',
    name: 'School of Physical Sciences',
    shortName: 'Science',
    zone: 'New Site',
    landmarkHint: 'Science Quadrangle Entrance',
    x: 410,
    y: 235,
  },
  {
    id: 'library',
    name: 'Sam Jonah Library',
    shortName: 'Library',
    zone: 'Central Academic',
    landmarkHint: 'Library Front Steps',
    x: 560,
    y: 255,
  },
  {
    id: 'lt',
    name: 'C.A. Ackah Lecture Theatre (LT)',
    shortName: 'Lecture Theatre',
    zone: 'Central Academic',
    landmarkHint: 'Large Lecture Theatre Drop-off',
    x: 645,
    y: 205,
  },
  {
    id: 'oguaa',
    name: 'Oguaa Hall',
    shortName: 'Oguaa',
    zone: 'Old Site',
    landmarkHint: 'Old Site Hall Forecourt',
    x: 755,
    y: 280,
  },
  {
    id: 'adehye',
    name: 'Adehye Hall',
    shortName: 'Adehye',
    zone: 'Old Site',
    landmarkHint: 'Adehye Hall Car Park',
    x: 845,
    y: 235,
  },
  {
    id: 'atl',
    name: 'Atlantic Hall (ATL)',
    shortName: 'ATL',
    zone: 'Old Site',
    landmarkHint: 'ATL Coastal Road Gate',
    x: 865,
    y: 350,
  },
  {
    id: 'hospital',
    name: 'UCC Hospital',
    shortName: 'Hospital',
    zone: 'Old Site',
    landmarkHint: 'OPD Emergency Lay-by',
    x: 740,
    y: 385,
  },
  {
    id: 'westgate',
    name: 'UCC West Gate (Main Entrance)',
    shortName: 'West Gate',
    zone: 'Highway Gate',
    landmarkHint: 'Takoradi–Cape Coast Highway Junction',
    x: 165,
    y: 365,
  },
  {
    id: 'amamoma',
    name: 'Amamoma Junction',
    shortName: 'Amamoma',
    zone: 'Hostel Corridor',
    landmarkHint: 'Amamoma Hostel Taxi Rank',
    x: 135,
    y: 215,
  },
  {
    id: 'ayensu',
    name: 'Ayensu Plaza',
    shortName: 'Ayensu',
    zone: 'Hostel Corridor',
    landmarkHint: 'Ayensu Hostel Main Road',
    x: 295,
    y: 395,
  },
  {
    id: 'apewosika',
    name: 'Apewosika Junction',
    shortName: 'Apewosika',
    zone: 'Hostel Corridor',
    landmarkHint: 'Apewosika Student Market',
    x: 525,
    y: 415,
  },
  {
    id: 'src',
    name: 'SRC Hostel',
    shortName: 'SRC Hostel',
    zone: 'New Site',
    landmarkHint: 'SRC Hostel Security Post',
    x: 295,
    y: 255,
  },
  {
    id: 'sms',
    name: 'School of Medical Sciences (SMS)',
    shortName: 'SMS',
    zone: 'New Site',
    landmarkHint: 'Medical Sciences Auditorium',
    x: 615,
    y: 115,
  },
];

export const RIDE_TIERS: Record<
  RideTier,
  {
    label: string;
    subtitle: string;
    multiplier: number;
    maxPassengers: number;
  }
> = {
  shared: {
    label: 'Campus Shared',
    subtitle: 'Standard campus taxi rate · 1–3 seats',
    multiplier: 1.0,
    maxPassengers: 3,
  },
  charter: {
    label: 'Private Charter',
    subtitle: 'Direct point-to-point cabin · Up to 4 seats',
    multiplier: 1.5,
    maxPassengers: 4,
  },
  accessible: {
    label: 'Accessible / Group',
    subtitle: 'Priority boarding & extra luggage space',
    multiplier: 1.75,
    maxPassengers: 4,
  },
};

export function calculateEstimatedFare(
  pickupId: string,
  dropoffId: string,
  tier: RideTier,
  passengersCount = 1
): { fareGhs: number; distanceKm: number; estDurationMins: number } {
  const from = UCC_LOCATIONS.find((l) => l.id === pickupId);
  const to = UCC_LOCATIONS.find((l) => l.id === dropoffId);

  if (!from || !to || from.id === to.id) {
    return { fareGhs: 0, distanceKm: 0, estDurationMins: 0 };
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const schematicDist = Math.sqrt(dx * dx + dy * dy);
  // Scale schematic units (~100-750) to realistic UCC campus distances (0.8 km – 4.8 km)
  const distanceKm = Math.max(0.8, Math.round((schematicDist / 160) * 10) / 10);
  const estDurationMins = Math.max(4, Math.round(distanceKm * 3.2 + 2));

  // Base campus fare GH₵ 7.00 + GH₵ 2.00 per km, rounded to nearest GH₵ 1.00
  const baseStandard = 7 + distanceKm * 2.0;
  const tierRate = baseStandard * RIDE_TIERS[tier].multiplier;
  const groupAddon = tier === 'shared' && passengersCount > 1 ? (passengersCount - 1) * 4 : 0;
  const fareGhs = Math.round(tierRate + groupAddon);

  return { fareGhs, distanceKm, estDurationMins };
}

export function formatGhs(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}

/**
 * Validates Ghana +233 phone numbers (or local 0XX numbers which can be normalized).
 * Accepts +233241234567, +233 24 123 4567, or 0241234567.
 */
export function normalizeGhanaPhone(input: string): string | null {
  const cleaned = input.replace(/[\s()-]/g, '');
  let digits = '';

  if (cleaned.startsWith('+233')) {
    digits = cleaned.slice(4);
  } else if (cleaned.startsWith('233') && cleaned.length === 12) {
    digits = cleaned.slice(3);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    digits = cleaned.slice(1);
  } else {
    return null;
  }

  if (!/^[235][0-9]{8}$/.test(digits)) {
    return null;
  }

  return `+233 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export const HERO_TAXI_IMAGE = '/src/assets/images/ucc_campus_taxi_hero_1794545389020.jpg';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-student-1',
    name: 'Akosua Darko',
    role: 'passenger',
    phone: '+233 24 519 8832',
    email: 'akosua.darko@stu.ucc.edu.gh',
    password: 'password123',
    studentOrStaffId: 'PS/CSC/22/0148',
    hallOrDepartment: 'Valco Hall · Computer Science',
    status: 'active',
    joinedAt: '2026-09-02',
  },
  {
    id: 'usr-student-2',
    name: 'Nana Kwaku Boateng',
    role: 'passenger',
    phone: '+233 50 412 7709',
    email: 'nana.boateng@stu.ucc.edu.gh',
    password: 'password123',
    studentOrStaffId: 'BS/BMS/23/0094',
    hallOrDepartment: 'Casford Hall · Biomedical Sciences',
    status: 'active',
    joinedAt: '2026-09-05',
  },
  {
    id: 'usr-driver-1',
    name: 'Kwame Mensah',
    role: 'driver',
    phone: '+233 24 881 3045',
    email: 'kwame.mensah@campusride.ucc.gh',
    password: 'password123',
    studentOrStaffId: 'UCC-DRV-104',
    hallOrDepartment: 'New Site Taxi Union',
    status: 'active',
    joinedAt: '2026-08-15',
  },
  {
    id: 'usr-driver-2',
    name: 'Afua Boakye',
    role: 'driver',
    phone: '+233 55 309 6128',
    email: 'afua.boakye@campusride.ucc.gh',
    password: 'password123',
    studentOrStaffId: 'UCC-DRV-112',
    hallOrDepartment: 'Central Library Rank',
    status: 'active',
    joinedAt: '2026-08-21',
  },
  {
    id: 'usr-driver-3',
    name: 'Kofi Boateng',
    role: 'driver',
    phone: '+233 20 744 9201',
    email: 'kofi.boateng@campusride.ucc.gh',
    password: 'password123',
    studentOrStaffId: 'UCC-DRV-089',
    hallOrDepartment: 'Old Site & Hospital Rank',
    status: 'active',
    joinedAt: '2026-07-10',
  },
  {
    id: 'usr-driver-4',
    name: 'Yaw Asante',
    role: 'driver',
    phone: '+233 27 615 4490',
    email: 'yaw.asante@campusride.ucc.gh',
    password: 'password123',
    studentOrStaffId: 'UCC-DRV-138',
    hallOrDepartment: 'Amamoma Hostel Corridor',
    status: 'active',
    joinedAt: '2026-10-28',
  },
  {
    id: 'usr-admin-1',
    name: 'Dr. Efua Sarpong',
    role: 'admin',
    phone: '+233 24 200 1184',
    email: 'transport.dispatch@ucc.edu.gh',
    password: 'password123',
    studentOrStaffId: 'UCC-STF-021',
    hallOrDepartment: 'Directorate of Campus Transport',
    status: 'active',
    joinedAt: '2026-06-01',
  },
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'drv-1',
    userId: 'usr-driver-1',
    name: 'Kwame Mensah',
    phone: '+233 24 881 3045',
    avatarUrl: '/src/assets/images/driver_kwame_mensah_1794545389246.jpg',
    vehicleModel: 'Toyota Corolla (Silver/Navy)',
    vehicleColor: 'Silver',
    plateNumber: 'CR 4821-24',
    seats: 4,
    supportsAccessible: false,
    homeZone: 'New Site',
    rating: 4.9,
    completedTrips: 312,
    verificationStatus: 'verified',
    isAvailable: true,
    licenseNumber: 'DVLA-CR-99421',
    estimatedPickupMins: 4,
  },
  {
    id: 'drv-2',
    userId: 'usr-driver-2',
    name: 'Afua Boakye',
    phone: '+233 55 309 6128',
    avatarUrl: '/src/assets/images/driver_abena_osei_1794545389869.jpg',
    vehicleModel: 'Hyundai Elantra (White)',
    vehicleColor: 'White',
    plateNumber: 'CR 1904-23',
    seats: 4,
    supportsAccessible: true,
    homeZone: 'Central Academic',
    rating: 4.95,
    completedTrips: 248,
    verificationStatus: 'verified',
    isAvailable: true,
    licenseNumber: 'DVLA-CR-88104',
    estimatedPickupMins: 3,
  },
  {
    id: 'drv-3',
    userId: 'usr-driver-3',
    name: 'Kofi Boateng',
    phone: '+233 20 744 9201',
    avatarUrl: '/src/assets/images/driver_kofi_boateng_1794545389782.jpg',
    vehicleModel: 'Toyota Matrix (Navy Blue)',
    vehicleColor: 'Navy',
    plateNumber: 'CR 7732-24',
    seats: 4,
    supportsAccessible: true,
    homeZone: 'Old Site',
    rating: 4.8,
    completedTrips: 405,
    verificationStatus: 'verified',
    isAvailable: true,
    licenseNumber: 'DVLA-CR-55312',
    estimatedPickupMins: 6,
  },
  {
    id: 'drv-4',
    userId: 'usr-driver-4',
    name: 'Yaw Asante',
    phone: '+233 27 615 4490',
    avatarUrl: '/src/assets/images/driver_yaw_asante_1794545390437.jpg',
    vehicleModel: 'Kia Morning (Metallic Gray)',
    vehicleColor: 'Gray',
    plateNumber: 'GC 3319-22',
    seats: 3,
    supportsAccessible: false,
    homeZone: 'Hostel Corridor',
    rating: 4.7,
    completedTrips: 14,
    verificationStatus: 'pending',
    isAvailable: false,
    licenseNumber: 'DVLA-GC-40198',
    estimatedPickupMins: 5,
  },
];

export const INITIAL_RIDES: RideRequest[] = [
  {
    id: 'RIDE-8421',
    passengerId: 'usr-student-1',
    passengerName: 'Akosua Darko',
    passengerPhone: '+233 24 519 8832',
    driverId: 'drv-1',
    pickupLocationId: 'valco',
    dropoffLocationId: 'library',
    tier: 'shared',
    passengersCount: 1,
    pickupNote: 'Standing near Valco Porter Lodge noticeboard',
    fareGhs: 11,
    paymentMethod: 'MTN MoMo (Driver Direct)',
    status: 'completed',
    createdAt: '2026-11-12T08:15:00Z',
    updatedAt: '2026-11-12T08:29:00Z',
    declinedByDriverIds: [],
  },
  {
    id: 'RIDE-8424',
    passengerId: 'usr-student-2',
    passengerName: 'Nana Kwaku Boateng',
    passengerPhone: '+233 50 412 7709',
    driverId: 'drv-2',
    pickupLocationId: 'casford',
    dropoffLocationId: 'hospital',
    tier: 'charter',
    passengersCount: 1,
    pickupNote: 'Casford roundabout bus shelter',
    fareGhs: 21,
    paymentMethod: 'Cash on Arrival',
    status: 'en_route',
    createdAt: '2026-11-12T10:40:00Z',
    updatedAt: '2026-11-12T10:43:00Z',
    declinedByDriverIds: [],
  },
  {
    id: 'RIDE-8426',
    passengerId: 'usr-student-2',
    passengerName: 'Nana Kwaku Boateng',
    passengerPhone: '+233 50 412 7709',
    driverId: null,
    pickupLocationId: 'amamoma',
    dropoffLocationId: 'science',
    tier: 'shared',
    passengersCount: 2,
    pickupNote: 'Opposite Amamoma Star Pharmacy',
    fareGhs: 15,
    paymentMethod: 'Cash on Arrival',
    status: 'requested',
    createdAt: '2026-11-12T11:02:00Z',
    updatedAt: '2026-11-12T11:02:00Z',
    declinedByDriverIds: [],
  },
  {
    id: 'RIDE-8410',
    passengerId: 'usr-student-1',
    passengerName: 'Akosua Darko',
    passengerPhone: '+233 24 519 8832',
    driverId: 'drv-3',
    pickupLocationId: 'library',
    dropoffLocationId: 'westgate',
    tier: 'charter',
    passengersCount: 1,
    pickupNote: 'Library lower gate',
    fareGhs: 19,
    paymentMethod: 'Cash on Arrival',
    status: 'completed',
    createdAt: '2026-11-10T16:10:00Z',
    updatedAt: '2026-11-10T16:28:00Z',
    declinedByDriverIds: [],
  },
  {
    id: 'RIDE-8398',
    passengerId: 'usr-student-1',
    passengerName: 'Akosua Darko',
    passengerPhone: '+233 24 519 8832',
    driverId: 'drv-2',
    pickupLocationId: 'oguaa',
    dropoffLocationId: 'valco',
    tier: 'shared',
    passengersCount: 1,
    pickupNote: 'Oguaa Hall steps',
    fareGhs: 14,
    paymentMethod: 'MTN MoMo (Driver Direct)',
    status: 'cancelled',
    createdAt: '2026-11-08T14:20:00Z',
    updatedAt: '2026-11-08T14:23:00Z',
    declinedByDriverIds: [],
    cancelledBy: 'passenger',
    cancelReason: 'Lecture rescheduled',
  },
];
