import React from 'react';
import { UCC_LOCATIONS } from '../data/uccData';
import { CampusLocation, RideStatus } from '../types/campus';
import { Info } from 'lucide-react';

interface CampusMapSchematicProps {
  pickupId?: string;
  dropoffId?: string;
  activeStatus?: RideStatus;
  interactiveMode?: 'pickup' | 'dropoff' | null;
  onSelectLocation?: (locationId: string) => void;
  heightClass?: string;
}

const CAMPUS_ROADS: Array<[string, string]> = [
  ['amamoma', 'valco'],
  ['valco', 'casford'],
  ['casford', 'nkrumah'],
  ['nkrumah', 'sms'],
  ['amamoma', 'src'],
  ['src', 'valco'],
  ['src', 'science'],
  ['casford', 'science'],
  ['science', 'library'],
  ['nkrumah', 'lt'],
  ['sms', 'lt'],
  ['library', 'lt'],
  ['lt', 'adehye'],
  ['library', 'oguaa'],
  ['adehye', 'oguaa'],
  ['oguaa', 'atl'],
  ['oguaa', 'hospital'],
  ['hospital', 'atl'],
  ['westgate', 'amamoma'],
  ['westgate', 'ayensu'],
  ['ayensu', 'src'],
  ['ayensu', 'apewosika'],
  ['apewosika', 'library'],
  ['apewosika', 'hospital'],
];

const ZONE_REGIONS = [
  { label: 'HOSTEL CORRIDOR', x: 115, y: 60, w: 230, h: 410 },
  { label: 'NEW SITE CAMPUS', x: 205, y: 55, w: 465, h: 245 },
  { label: 'CENTRAL ACADEMIC', x: 500, y: 175, w: 205, h: 125 },
  { label: 'OLD SITE & COASTAL', x: 695, y: 185, w: 235, h: 255 },
];

export const CampusMapSchematic: React.FC<CampusMapSchematicProps> = ({
  pickupId,
  dropoffId,
  activeStatus,
  interactiveMode = null,
  onSelectLocation,
  heightClass = 'h-[320px] sm:h-[380px] lg:h-[430px]',
}) => {
  const locMap = React.useMemo(() => {
    const map = new Map<string, CampusLocation>();
    UCC_LOCATIONS.forEach((loc) => map.set(loc.id, loc));
    return map;
  }, []);

  const pickup = pickupId ? locMap.get(pickupId) : undefined;
  const dropoff = dropoffId ? locMap.get(dropoffId) : undefined;

  // Approximate schematic taxi position along route based on demonstration status
  let taxiPos: { x: number; y: number } | null = null;
  if (pickup && dropoff && activeStatus) {
    if (activeStatus === 'en_route') {
      taxiPos = {
        x: pickup.x - 42,
        y: pickup.y + 24,
      };
    } else if (activeStatus === 'arrived') {
      taxiPos = { x: pickup.x, y: pickup.y };
    } else if (activeStatus === 'in_progress') {
      taxiPos = {
        x: (pickup.x + dropoff.x) / 2,
        y: (pickup.y + dropoff.y) / 2,
      };
    } else if (activeStatus === 'completed') {
      taxiPos = { x: dropoff.x, y: dropoff.y };
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-campus-sm overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 bg-[#F8F9FB]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#142B4A]">
            UCC Campus Zone Network
          </span>
          {interactiveMode && (
            <span className="text-xs text-[#64748B]">
              Click any node to set{' '}
              <strong className="text-[#202938]">
                {interactiveMode === 'pickup' ? 'Pickup' : 'Drop-off'}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#22A06B] bg-white inline-block" />
            Pickup
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8A34] inline-block" />
            Drop-off
          </span>
        </div>
      </div>

      <div className={`relative w-full ${heightClass} bg-[#F4F6F8]`}>
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full select-none"
          role="img"
          aria-label="Schematic University of Cape Coast campus taxi route map"
        >
          {/* Subtle campus grid */}
          <defs>
            <pattern
              id="campus-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="url(#campus-grid)" />

          {/* Atlantic Ocean strip on southern coastal border near ATL */}
          <path
            d="M 0 460 Q 320 445 640 462 T 1000 448 L 1000 500 L 0 500 Z"
            fill="#DBEAFE"
            opacity="0.7"
          />
          <text
            x="830"
            y="482"
            fontSize="10"
            fontWeight="600"
            letterSpacing="1.6"
            fill="#324768"
            opacity="0.7"
          >
            GULF OF GUINEA COASTLINE
          </text>

          {/* Campus Zone Regions */}
          {ZONE_REGIONS.map((z) => (
            <g key={z.label}>
              <rect
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                rx="16"
                fill="#FFFFFF"
                fillOpacity="0.45"
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={z.x + 12}
                y={z.y + 18}
                fontSize="10"
                fontWeight="700"
                letterSpacing="1.1"
                fill="#64748B"
              >
                {z.label}
              </text>
            </g>
          ))}

          {/* Campus Road Links */}
          {CAMPUS_ROADS.map(([aId, bId]) => {
            const a = locMap.get(aId);
            const b = locMap.get(bId);
            if (!a || !b) return null;
            return (
              <line
                key={`${aId}-${bId}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#CBD5E1"
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}

          {/* Estimated Route Arc */}
          {pickup && dropoff && pickup.id !== dropoff.id && (
            <g>
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={dropoff.x}
                y2={dropoff.y}
                stroke="#142B4A"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="9 7"
              />
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={dropoff.x}
                y2={dropoff.y}
                stroke="#FF8A34"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Location Nodes */}
          {UCC_LOCATIONS.map((loc) => {
            const isPickup = loc.id === pickupId;
            const isDropoff = loc.id === dropoffId;
            const isClickable = Boolean(onSelectLocation);

            return (
              <g
                key={loc.id}
                onClick={() => onSelectLocation && onSelectLocation(loc.id)}
                className={isClickable ? 'cursor-pointer' : ''}
              >
                {/* Larger invisible hit area for touch ergonomics */}
                <circle cx={loc.x} cy={loc.y} r="18" fill="transparent" />

                {/* Outer highlight ring for selected nodes */}
                {(isPickup || isDropoff) && (
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r="13"
                    fill={isPickup ? '#DCFCE7' : '#FFDBC8'}
                  />
                )}

                {/* Main node circle */}
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r={isPickup || isDropoff ? 7 : 5.5}
                  fill={
                    isDropoff
                      ? '#FF8A34'
                      : isPickup
                        ? '#FFFFFF'
                        : '#FFFFFF'
                  }
                  stroke={
                    isPickup
                      ? '#22A06B'
                      : isDropoff
                        ? '#984800'
                        : '#142B4A'
                  }
                  strokeWidth={isPickup ? 3.5 : 2}
                />

                {/* Label pill */}
                <rect
                  x={loc.x - 42}
                  y={loc.y + 11}
                  width="84"
                  height="18"
                  rx="4"
                  fill={
                    isPickup || isDropoff ? '#142B4A' : 'rgba(255,255,255,0.9)'
                  }
                  stroke={isPickup || isDropoff ? '#142B4A' : '#E2E8F0'}
                  strokeWidth="0.75"
                />
                <text
                  x={loc.x}
                  y={loc.y + 23}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isPickup || isDropoff ? '700' : '600'}
                  fill={isPickup || isDropoff ? '#FFFFFF' : '#202938'}
                >
                  {loc.shortName}
                </text>
              </g>
            );
          })}

          {/* Schematic Taxi Marker for Active Ride */}
          {taxiPos && (
            <g transform={`translate(${taxiPos.x}, ${taxiPos.y - 18})`}>
              <rect
                x="-28"
                y="-11"
                width="56"
                height="20"
                rx="10"
                fill="#142B4A"
                stroke="#FF8A34"
                strokeWidth="2"
              />
              <text
                x="0"
                y="2.5"
                textAnchor="middle"
                fontSize="9.5"
                fontWeight="700"
                fill="#FFFFFF"
              >
                TAXI
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="px-4 py-2.5 bg-[#F8F9FB] border-t border-[#E2E8F0] flex items-center gap-2 text-xs text-[#64748B]">
        <Info className="w-3.5 h-3.5 text-[#142B4A] shrink-0" />
        <span>
          Schematic UCC campus zone map for route estimation only — not live GPS tracking.
        </span>
      </div>
    </div>
  );
};
