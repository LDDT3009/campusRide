import React from 'react';
import { RideStatus, UserStatus, VerificationStatus } from '../types/campus';

type BadgeVariant =
  | RideStatus
  | VerificationStatus
  | UserStatus
  | 'available'
  | 'offline';

const VARIANT_STYLES: Record<
  BadgeVariant,
  { bg: string; text: string; dot: string; label: string }
> = {
  verified: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#15803D]',
    dot: 'bg-[#22A06B]',
    label: 'Verified',
  },
  active: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#15803D]',
    dot: 'bg-[#22A06B]',
    label: 'Active',
  },
  available: {
    bg: 'bg-[#DCFCE7]',
    text: 'text-[#15803D]',
    dot: 'bg-[#22A06B]',
    label: 'Available',
  },
  pending: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
    dot: 'bg-[#F59E0B]',
    label: 'Pending Verification',
  },
  requested: {
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
    dot: 'bg-[#F59E0B]',
    label: 'Requested',
  },
  accepted: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#2563EB]',
    label: 'Driver Assigned',
  },
  en_route: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#2563EB]',
    label: 'En Route',
  },
  arrived: {
    bg: 'bg-[#DBEAFE]',
    text: 'text-[#1D4ED8]',
    dot: 'bg-[#2563EB]',
    label: 'Arrived at Pickup',
  },
  in_progress: {
    bg: 'bg-[#FFDBC8]',
    text: 'text-[#984800]',
    dot: 'bg-[#FF8A34]',
    label: 'In Progress',
  },
  completed: {
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#475569]',
    dot: 'bg-[#64748B]',
    label: 'Completed',
  },
  offline: {
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#475569]',
    dot: 'bg-[#64748B]',
    label: 'Offline',
  },
  cancelled: {
    bg: 'bg-[#FFE4E6]',
    text: 'text-[#BE123C]',
    dot: 'bg-[#E11D48]',
    label: 'Cancelled',
  },
  suspended: {
    bg: 'bg-[#FFE4E6]',
    text: 'text-[#BE123C]',
    dot: 'bg-[#E11D48]',
    label: 'Suspended',
  },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  labelOverride?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  labelOverride,
}) => {
  const style = VARIANT_STYLES[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-[0.04em] uppercase whitespace-nowrap shrink-0 ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{labelOverride || style.label}</span>
    </span>
  );
};
