# Chrono — Implementation Plan

> A mobile-first PWA that looks, feels, and behaves like a mechanical analog watch — but responds to your voice. One word spoken, and the hands transform into a compass, speedometer, thermometer, AQI gauge, or planetary clock.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Hosting | Vercel |
| Styling | Tailwind CSS + custom SVG |
| Animation | Framer Motion (hands, mode switches, transitions) |
| Alert animations | Web Animations API (shakes, pulses — off main thread) |
| Live tracking | `requestAnimationFrame` (compass, speed — 60fps) |
| Bezel arcs | SVG `stroke-dashoffset` (AQI and speed ring fills) |
| Theme transitions | CSS Custom Properties (interpolated color) |
| Voice | Web Speech API (browser-native, no cost) |
| Astronomy | `astronomy-engine` npm (client-side planetary math) |
| Weather / AQI | OpenWeatherMap API (free tier) |
| Speed limits | OpenStreetMap Overpass API (free) |
| Routing | OpenRouteService (free) |
| PWA | `next-pwa` (service worker, installable) |

---

## Project Structure

```
chrono/
├── app/
│   ├── page.tsx                    ← Main watch UI
│   ├── layout.tsx                  ← PWA meta, font load
│   └── api/
│       ├── weather/route.ts        ← OpenWeatherMap proxy
│       ├── aqi/route.ts            ← OWM Air Pollution proxy
│       ├── speedlimit/route.ts     ← OSM Overpass speed limit
│       └── geocode/route.ts        ← Coords → place name
│
├── components/
│   ├── WatchShell.tsx              ← Root: owns theme + mode context
│   ├── WatchFace.tsx               ← The circle, touch/tap target
│   ├── WatchBezel.tsx              ← Outer ring, rotates per mode
│   ├── WatchDial.tsx               ← Inner face, hosts overlays
│   ├── WatchHands.tsx              ← Coordinates all three hands
│   ├── HourHand.tsx
│   ├── MinuteHand.tsx
│   ├── SecondsHand.tsx             ← Continuous sweep
│   ├── CenterPin.tsx               ← Center dot, pulses with mic/alert
│   ├── CenterLabel.tsx             ← Mode name, fades in → shrinks
│   ├── ModeOverlay/
│   │   ├── index.tsx               ← Swaps overlay on mode change
│   │   ├── CompassOverlay.tsx
│   │   ├── TempOverlay.tsx
│   │   ├── AQIOverlay.tsx
│   │   ├── SpeedOverlay.tsx
│   │   ├── WorldClockOverlay.tsx
│   │   ├── PlanetOverlay.tsx
│   │   └── NullOverlay.tsx
│   ├── StatusLine.tsx              ← One-line data readout, typewriter
│   ├── AlertOverlay.tsx            ← Full-face color bleed, z-top
│   ├── VoiceTrigger.tsx            ← Mute/unmute mic button (crown position)
│   ├── ThemeToggle.tsx             ← Preview dot, tap to cycle
│   ├── ModeQuickBar.tsx            ← Tap fallback icon strip
│   └── PermissionGate.tsx          ← Wraps sensor-dependent modes
│
├── hooks/
│   ├── useTime.ts                  ← Clock → hand rotation degrees
│   ├── useCompass.ts               ← DeviceOrientation → bearing
│   ├── useGeolocation.ts           ← GPS coords, speed, heading
│   ├── useVoice.ts                 ← Speech API, mute/unmute, dispatch
│   ├── useWeather.ts               ← Fetches /api/weather
│   ├── useAQI.ts                   ← Fetches /api/aqi
│   ├── useSpeedLimit.ts            ← Fetches /api/speedlimit
│   ├── usePlanetaryTime.ts         ← astronomy-engine wrapper
│   ├── useWorldClock.ts            ← Intl timezone → hand degrees
│   ├── useTheme.ts                 ← Theme state + toggle
│   ├── useMode.ts                  ← Mode state + dispatcher
│   └── useAlert.ts                 ← Alert state, trigger/dismiss
│
├── lib/
│   ├── voiceCommands.ts            ← Trigger word map + phrase parser
│   ├── planetaryTime.ts            ← Planet day lengths + math
│   ├── worldClock.ts               ← City/country → IANA timezone map
│   └── speedAlert.ts               ← Speed vs. limit comparison logic
│
├── context/
│   ├── ThemeContext.tsx
│   └── ModeContext.tsx
│
└── public/
    └── manifest.json               ← PWA manifest
```

---

## Design System

### Themes

| Theme | Face | Hands | Accent |
|---|---|---|---|
| ⬜ Arctic | White | Off-white | Light grey |
| ⬛ Void | Deep black | White | Pure white |
| 🟫 Brass | Warm cream | Gold | Amber |
| 🔵 Abyss | Dark navy | Ice blue | Cyan |
| 🔴 Alert | Auto-triggered only | Red | Red |

### Animation Laws
1. **Hands never teleport** — all rotations are animated, no jumps
2. **Weight** — hands decelerate as they settle, they have mass
3. **Silence by default** — at rest, only the seconds hand moves

### Mode Switch Animation (~1.4s total)
```
1. Mode name fades in at center      (200ms)
2. Hands spin rapidly inward         (300ms — like winding)
3. Brief held pause                  (150ms)
4. Hands swing to new positions      (600ms — mechanical ease-out)
5. Mode name shrinks to top label    (300ms)
```

### Theme Change Animation
```
1. Face ripples outward from tap     (400ms)
2. Color bleeds from center          (300ms)
3. Hands disappear into new color    (200ms)
4. Hands re-emerge in new color      (300ms)
```

---

## Voice System

- **Always-on mic** with mute/unmute — muted by default on every load
- Mic icon placed at **top edge of the watch face** (the crown metaphor)
- Confidence threshold: **0.75 minimum** to filter noise
- State never persisted across sessions — always starts muted

### Trigger Word Map

| Spoken | Mode |
|---|---|
| `"Navigate"` / `"Guide me"` | GPS Navigation |
| `"North"` / `"South"` / `"East"` / `"West"` | Compass / Cardinal |
| `"Temperature"` / `"Temp"` | Thermometer |
| `"Air"` / `"AQI"` / `"Breathe"` | Air Quality Index |
| `"Time in [city/country]"` | World Clock |
| `"Speed"` | Speedometer |
| `"Planet [name]"` | Planetary Time |
| `"Reverse"` / `"Anti"` | Anti-Clockwise |
| `"Reset"` / `"Home"` | Idle Clock |
| `"Theme"` / `"Change"` | Cycle Theme |
| `"Stop"` / `"Pause"` | Freeze hands |
| `"Mute"` / `"Stop listening"` | Close mic |

---

## API Routes

| Route | Input | Output | Cache |
|---|---|---|---|
| `/api/weather` | `{ lat, lon }` | `{ temp_c, temp_f, feels_like, condition }` | 5 min |
| `/api/aqi` | `{ lat, lon }` | `{ aqi: 1–5, pm2_5, pm10, label }` | 10 min |
| `/api/speedlimit` | `{ lat, lon }` | `{ limit_kmh, limit_mph, road_name }` | 30 sec |
| `/api/geocode` | `{ lat, lon }` | `{ place_name, city, country }` | 1 hr |

---

## Permissions Strategy

**Rule: Never ask on load. Ask at the moment the feature is first used.**

| Permission | Triggered By | If Denied |
|---|---|---|
| 📍 Location | Navigate, Speed, Temp, AQI first use | Mode disabled silently |
| 🎙️ Microphone | First tap of mic icon | Tap-only mode, never re-asked |
| 📡 Motion/Orientation | First Compass use | Compass disabled, message shown |
| 📷 Camera | Body temp feature | Feature hidden, never re-asked |

---

## Development Phases

### Phase 1 — Foundation
The watch as a watch. Everything that works without sensors or APIs.

- [ ] Scaffold Next.js 14 project, Tailwind, Framer Motion, `next-pwa`
- [ ] SVG watch face (`WatchShell`, `WatchFace`, `WatchDial`, `WatchBezel`)
- [ ] Working analog hands (`HourHand`, `MinuteHand`, `SecondsHand`) via `useTime`
- [ ] `CenterPin`, `CenterLabel`, `StatusLine` components
- [ ] Mode switch hero animation (spin-in, hold, swing-out)
- [ ] `ThemeContext` + all 4 themes with CSS custom properties
- [ ] `ThemeToggle` with ripple animation
- [ ] `useVoice` hook — mute/unmute toggle, always-on listening, command dispatch
- [ ] `VoiceTrigger` component at crown position with state animations
- [ ] `voiceCommands.ts` — trigger map + phrase parser
- [ ] World Clock mode (`useWorldClock`, `WorldClockOverlay`)
- [ ] Anti-Clockwise mode (reverse hand direction, face mirror flip)
- [ ] `ModeQuickBar` — tap fallback when voice unavailable
- [ ] `PermissionGate` component
- [ ] PWA manifest + `next-pwa` config (installable on mobile)

### Phase 2 — Sensors & Environment
Features that use the device sensors and external APIs.

- [ ] `useCompass` — DeviceOrientation → bearing degrees
- [ ] Compass / Cardinal directions mode + `CompassOverlay`
- [ ] `useGeolocation` — GPS coords, speed, heading
- [ ] GPS Navigation mode (heading-based) + `NullOverlay` (bare compass rose)
- [ ] `/api/weather` route + `useWeather` hook
- [ ] Temperature mode + `TempOverlay` (hour = outdoor, minute = body estimate)
- [ ] `/api/aqi` route + `useAQI` hook
- [ ] AQI mode + `AQIOverlay` + bezel arc fill via `stroke-dashoffset`
- [ ] `AlertOverlay` — full-face color bleed for AQI > 150
- [ ] Hand animation transitions between all Phase 1 + 2 modes

### Phase 3 — Motion & Speed
Real-time speed tracking and overspeed alerting.

- [ ] Speedometer mode — minute hand sweeps GPS velocity via `requestAnimationFrame`
- [ ] `SpeedOverlay` — speed arc on bezel
- [ ] `/api/speedlimit` route (OSM Overpass) + `useSpeedLimit` hook
- [ ] `speedAlert.ts` — speed vs. limit comparison
- [ ] Overspeed alert — red bleed, hand shake (Web Animations API), `navigator.vibrate`
- [ ] Wrong-lane detection (heading vs. road direction from OSM)
- [ ] `useAlert` hook — alert state, trigger, dismiss

### Phase 4 — Planetary & Polish
Final features and production hardening.

- [ ] `usePlanetaryTime` — `astronomy-engine` wrapper for all 7 planets
- [ ] Planetary Time mode + `PlanetOverlay` (darkened face, faint stars)
- [ ] Body temperature via BLE (`navigator.bluetooth` Web Bluetooth API)
- [ ] Service Worker — offline caching for UI shell and local modes
- [ ] Sound design — optional subtle mechanical clicks on mode switch
- [ ] Full animation polish pass (easing curves, timing review)
- [ ] Responsive layout — desktop graceful degradation
- [ ] Environment variable setup for all API keys on Vercel
- [ ] Final deploy + PWA install QA on iOS and Android

---

## Known Constraints

| Constraint | Detail |
|---|---|
| HTTPS required | All sensor APIs need it — Vercel provides automatically |
| iOS DeviceOrientation | Requires user permission prompt on iOS 13+ |
| Web Speech API on iOS | Limited on Safari — tap fallback always available |
| Body temperature | No native mobile sensor — BLE device required for accuracy |
| Speed limit data | OSM is crowd-sourced — may be missing on some roads |
| Background running | iOS PWA can't run in background — screen must stay on |
| Mic on background | iOS auto-closes mic when app is backgrounded — one-tap resume prompt on return |

---

## Environment Variables (Vercel)

```
OPENWEATHERMAP_API_KEY=
OPENROUTESERVICE_API_KEY=
```

All other data sources (OSM Overpass, `Intl`, `astronomy-engine`, Web APIs) are free with no key required.
