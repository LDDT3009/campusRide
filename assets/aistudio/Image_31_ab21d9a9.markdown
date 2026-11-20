---
name: Campus Transit
colors:
  surface: '#f8f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4a5f81'
  primary: '#001632'
  on-primary: '#ffffff'
  primary-container: '#142b4a'
  on-primary-container: '#7d93b7'
  inverse-primary: '#b2c7ee'
  secondary: '#984800'
  on-secondary: '#ffffff'
  secondary-container: '#fe8933'
  on-secondary-container: '#652e00'
  tertiary: '#231300'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f2500'
  on-tertiary-container: '#b38b5b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#b2c7ee'
  on-primary-fixed: '#021c3a'
  on-primary-fixed-variant: '#324768'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb689'
  on-secondary-fixed: '#321300'
  on-secondary-fixed-variant: '#743500'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ecbf8a'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#5f4117'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.45'
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.025em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes an authoritative yet accessible environment tailored for university transit networks, campus safety escorts, and automated dispatch operations. It bridges institutional reliability with modern on-demand ride hailing ergonomics.

The visual direction centers on **Corporate / Modern** precision infused with student-focused warmth. Interface surfaces convey safety, transparency, and schedule predictability. Micro-elements emphasize punctuality, verified driver credentials, and high-visibility status monitoring under varying daylight and campus lighting conditions.

## Colors
The palette balances institutional integrity with high-visibility callouts:

- **Primary (`#142B4A` - Deep Collegiate Navy):** Anchors navigation headers, prominent buttons, structural frames, and definitive typography. Conveys security, administration, and organizational authority.
- **Secondary (`#FF8A34` - Energetic Orange):** Directs immediate physical action: ride hail requests, dispatch triggers, map routing markers, and urgent operational notifications.
- **Neutral Surface (`#F4F6F8` - Campus Gray Canvas):** Serves as the primary application background, dampening screen glare and separating card surfaces cleanly.
- **Pure Neutral (`#FFFFFF`):** High-level card containers, sheets, and active form controls.
- **Text Hierarchies:** Deep Charcoal (`#202938`) for body and headings; Slate Slate Muted (`#64748B`) for microcopy, plate numbers, and meta timestamps.
- **Semantic Feedback:**
  - **Success (`#22A06B`):** Driver match confirmed, vehicle arrived, ride complete.
  - **Alert/Danger (`#E11D48`):** Emergency SOS, route deviation, booking cancellation.
  - **Warning/Pending (`#F59E0B`):** Driver en route, delayed arrival, pending authorization.

## Typography
Inter delivers high legibility across mobile viewports, outdoor ambient light, and dense desktop dispatch matrices. 

- Use tabular numbers (`font-variant-numeric: tabular-nums`) across vehicle plate listings, arrival countdowns, pricing estimates, and GPS coordinate tracking.
- Reserve tight negative letter-spacing for headlines to maintain punch and authority, while micro-labels rely on wide letter-spacing (`label-sm`, `label-md`) with all-caps styling for vehicle state tracking.
- Body copy retains neutral spacing and an open line height (`1.5`) for readable campus building addresses and driver safety instructions.

## Layout & Spacing
The layout follows an adaptive fluid grid with responsive breakpoints:
- **Mobile (< 768px):** 4 columns, 16px margins, and 16px gutters. Booking interfaces utilize full-width bottom sheets, sticky footer actions, and fixed top app bars.
- **Tablet (768px – 1024px):** 8 columns, 24px margins, and 20px gutters. Map view takes 50% split screen; booking forms occupy a docked panel.
- **Desktop (> 1024px):** 12 columns, 40px outer margins, and 24px gutters. Administrative and fleet dispatch operations expand to high-density 3-pane workflows (driver fleet list, real-time campus map, active zone telemetry).

Internal component paddings adhere strictly to an 8pt step rhythm (4px micro, 8px compact, 16px standard, 24px elevated, 32px generous).

## Elevation & Depth
Visual hierarchy relies on clean surface layering paired with ambient, diffused shadows tinted by deep campus navy:

- **Flat / Ground Level (`z0`):** Base canvas background (`#F4F6F8`).
- **Low Elevation (`shadow-sm`):** `0 1px 3px rgba(20, 43, 74, 0.06), 0 1px 2px rgba(20, 43, 74, 0.04)`. Applied to standard cards, unselected fare tiers, and persistent list items.
- **Medium Elevation (`shadow-md`):** `0 4px 6px -1px rgba(20, 43, 74, 0.08), 0 2px 4px -2px rgba(20, 43, 74, 0.04)`. Applied to active booking sheets, interactive pickup search panels, driver vehicle cards, and map controls.
- **High Elevation (`shadow-lg`):** `0 10px 15px -3px rgba(20, 43, 74, 0.1), 0 4px 6px -4px rgba(20, 43, 74, 0.05)`. Applied to floating ride actions, route modals, and urgent ride-status alerts.
- **Borders & Dividers:** Keep borders subtle (`1px solid #E2E8F0`) to outline cards without visual clutter, reinforcing structure alongside soft shadows.

## Shapes
The shape philosophy blends accessible student design with structural order:
- Default elements (form inputs, buttons, segmented controls) utilize **`0.5rem` (`rounded-md`)**.
- Modular content containers, driver profile summaries, and transit schedule cards use **`1rem` (`rounded-xl`)** and **`1.5rem` (`rounded-2xl`)**.
- Status badges, campus zone indicators, rider verification tags, and round floating action buttons utilize full pill curvature (`rounded-full`).

## Components

### Buttons
- **Primary:** Solid `#142B4A` background with `#FFFFFF` text. Hover shifts to `#1E3A5F`; active states scale slightly down (`scale-98`). Height: 48px on mobile, 44px on desktop.
- **Accent (Call-to-Action):** Solid `#FF8A34` background with `#FFFFFF` text. Used exclusively for "Book Campus Ride", "Confirm Pickup", or "Call Escort". Hover state: `#E57523`.
- **Secondary / Ghost:** White background with `#142B4A` outline (`1px solid #CBD5E1`) and `#142B4A` label.
- **Destructive:** Solid `#E11D48` or outlined red for ride cancellation and emergency assistance triggers.

### Chips & Status Badges
- Pill-shaped (`rounded-full`) tags containing a leading 6px dot indicator alongside uppercase or capitalized text (`label-sm`):
  - **Verified:** Background `#DCFCE7`, text `#15803D`, dot `#22A06B`.
  - **Pending:** Background `#FEF3C7`, text `#B45309`, dot `#F59E0B`.
  - **En Route:** Background `#DBEAFE`, text `#1D4ED8`, dot `#2563EB`.
  - **Completed:** Background `#F1F5F9`, text `#475569`, dot `#64748B`.
  - **Alert / SOS:** Background `#FFE4E6`, text `#BE123C`, dot `#E11D48`.

### Input Fields & Location Selectors
- Background `#FFFFFF` with a crisp `1px solid #CBD5E1` border.
- Active focus state: `#142B4A` border ring (`2px`) with zero offset.
- Pickup and Drop-off paired inputs feature color-coded anchor nodes (Green outline for Pickup, Orange solid pin for Campus Drop-off) joined by a vertical dashed stroke (`#94A3B8`).

### Cards
- Constructed with `#FFFFFF` backgrounds, `rounded-xl` or `rounded-2xl` corners, subtle borders (`#E2E8F0`), and `shadow-sm`.
- Vehicle selection cards include driver thumbnail, rating chip, vehicle model, seat capacity tag, and real-time arrival estimate in bold tabular numerals.

### Lists & Activity Logs
- Clean dividing lines (`#F1F5F9`) between rows. Hover states highlight via `#F8FAFC`.
- Ride history rows present origin/destination node points, driver identity, date stamp, and completion badge with tabular fare amounts right-aligned.

### Checkboxes & Radios
- Checkboxes: `rounded-md`, border `#94A3B8`, filled with `#142B4A` upon selection with an inset white checkmark.
- Radio Selectors: Outer `#CBD5E1` ring expanding into a filled `#142B4A` core dot for fare and vehicle class selection (e.g., Campus Standard vs. Accessible Van).