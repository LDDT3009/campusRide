import React, { useState } from 'react';

interface DriverAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
};

export const DriverAvatar: React.FC<DriverAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
}) => {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (!avatarUrl || imgError) {
    return (
      <div
        aria-label={name}
        className={`${SIZE_CLASSES[size]} rounded-full bg-[#142B4A] text-white font-semibold flex items-center justify-center shrink-0 border border-[#E2E8F0]`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`${SIZE_CLASSES[size]} rounded-full object-cover shrink-0 border border-[#E2E8F0] bg-[#F1F5F9]`}
    />
  );
};
