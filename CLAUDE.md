# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev                    # Dev server on localhost:3000
npm run build                  # Next.js build (Node.js server, not static export)
npm run start                  # Production server on localhost:3000
npm run generate-availability  # One-off: regenerate static availability JSONs (legacy, not used in production)
npm run lint                   # ESLint
```

`npm run build` runs `next build`. The site runs as a **Node.js server** (not static export). iCal availability data is fetched live via API route `/api/availability`.

## Architecture

**Next.js 16 site running as Node.js server** on Hostinger. `images.unoptimized: true` is set because images are self-hosted JPEGs.

### Page Structure

- `/` — Single-page app: `Hero → USPs → Welcome → Location → Amenities → Gallery → AvailabilityInquiry → Footer`
- `/impressum` — Legal page, Header always in scrolled (light) state
- `/datenschutz` — Legal page, Header always in scrolled (light) state

### Header Logo-Switching

`Header.tsx` uses an `IntersectionObserver` on `#hero-sentinel` (a 1px div at the bottom of the Hero section). While the sentinel is visible, `overHero = true` → white logos + transparent background. Once scrolled past, `overHero = false` → brown logo + light background. On pages without a Hero (Impressum, Datenschutz), the sentinel doesn't exist so `overHero` is immediately set to `false`. Two logo files: `/public/logo.svg` (brown) and `/public/logo-white.svg` (white), cross-faded via opacity transition.

### Hero Slideshow

`Hero.tsx` uses a `setTimeout`-chain (not `setInterval`) to avoid drift. First slide (`IMG_6811.jpeg`) stays for 13 seconds on page load, then 6 seconds per slide thereafter. Ken-Burns effect is pure CSS `@keyframes` — no JS-driven transform state. Manual navigation via arrows/dots cancels the pending timeout and restarts the chain.

### Data Flow: Availability Calendar

1. **Runtime**: API route `/api/availability` returns merged blocked dates per apartment type. `/api/availability-units` returns per-unit blocked dates for combination search.
2. **iCal feeds**: Per unit, both Booking + Airbnb feeds are fetched and Union-merged. Config in `src/lib/apartments.ts` (`ICAL_FEEDS`), URLs in `.env.local`.
3. **Client**: `useUnitsAvailability` hook fetches `/api/availability-units` → `AvailabilityCalendar` shows dates blocked only when ALL units are blocked. `InquiryForm` uses `findCombinations()` to find valid apartment combos for the group.
4. **Inquiry**: `InquiryForm` POSTs to `/api/inquiry` → sends email via SMTP (nodemailer). Owner gets full details with Reply-To set to guest; guest gets a confirmation email.
5. **Build-time fallback**: `scripts/generate-availability.ts` can generate static JSON files (not used in production Node.js server mode).

### Critical Business Logic: 3-Unit Merge + Group Combinations

There are 5 physical apartments but only 3 types shown in Amenities. The "Apartment (49 m²)" type has 3 identical units. The calendar shows a date as blocked only when **all 5 units** are simultaneously booked. The inquiry form uses `src/lib/combinations.ts` to find valid combinations of available units for the group size. Singles shown first (if they fit); multi-unit combos shown for larger groups. Max 4 options, deduplicated by type-signature (never shows "Apartment 1/2/3" — always just "Apartment").

### Apartment Pricing (`src/lib/apartments.ts`)

| Type | Base/night | Included guests | Max guests | Max adults | +person |
|------|-----------|----------------|------------|------------|---------|
| `apartment` (49m²) | €130 | 2 | 4 | 2 | +€5 |
| `apartment-gross` (58m²) | €140 | 2 | 4 | 2 | +€5 |
| `apartment-premium` (60m²) | €170 | 4 | 5 | 4 | +€5 |

Minimum stay: 2 nights. At least 1 adult required. Child age max: 17. **5% discount** applied automatically for stays of 5+ nights.

### Mapbox Map (`src/components/ui/MapboxMap.tsx`)

Loaded via dynamic `import("mapbox-gl")` (lazy). Token from `NEXT_PUBLIC_MAPBOX_TOKEN`. Style: `mapbox://styles/mapbox/light-v11`. POI markers use fixed `34×34px` wrappers with `anchor: "center"` — do not change anchor or add transforms that affect layout, as this causes markers to jump. Current POIs: EDEKA, Volksbank, Innenstadt, Fahrradverleih. Uses `initializingRef` + `destroyed` flag to prevent double-init in React StrictMode.

## Styling

Tailwind CSS v4 with `@theme inline` in `src/app/globals.css`. All design tokens (colors, shadows, radii, spacing) are CSS custom properties — do **not** use a `tailwind.config.ts`. Color palette derived from logo color `#723E14` (warm brown).

Typography: `Lora` (serif, headings) + `Source Sans 3` (sans, body), loaded via `next/font/google`.

## Environment Variables

Defined in `.env.local`. Key variables:
- `ICAL_APARTMENT_1` through `ICAL_APARTMENT_PREMIUM` — Booking.com iCal URLs
- `ICAL_APARTMENT_1_AIRBNB` through `ICAL_APARTMENT_PREMIUM_AIRBNB` — Airbnb iCal URLs (union-merged per unit)
- `EMAIL_TO` — recipient for inquiry emails
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox GL JS public token
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — IONOS SMTP for `/api/inquiry` email sending

## Language

All UI text, validation messages, date formatting, and legal pages are in **German**. Use `de` locale from `date-fns/locale` for date operations. Week starts Monday. The city name is **Esens** (not Essen).
