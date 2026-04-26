# Copilot Chat Conversation Export: Complete project plan for MechNav Watch

**User:** @thebenmerlin
**Thread URL:** https://github.com/copilot/c/bbf70ca1-4d6c-40de-acd9-4dbb30d0ab54

## @thebenmerlin

This is where we are

## Copilot

## Component Breakdown — MechNav Watch

Here's every piece of the UI and logic, fully mapped out.

---

## 🗂️ Component Tree

```
<App>
 ├── <WatchShell>               ← Outermost container, theme context
 │    ├── <WatchFace>           ← The circle itself
 │    │    ├── <WatchBezel>     ← Outer ring, rotates per mode
 │    │    ├── <WatchDial>      ← Inner face, numerals (optional), mode overlays
 │    │    │    ├── <ModeOverlay>     ← Per-mode visual layer
 │    │    │    └── <CenterLabel>     ← Mode name / status text
 │    │    ├── <WatchHands>     ← All three hands
 │    │    │    ├── <HourHand>
 │    │    │    ├── <MinuteHand>
 │    │    │    └── <SecondsHand>
 │    │    └── <CenterPin>      ← The dot at the center
 │    ├── <StatusLine>          ← One-line readout below the face
 │    └── <AlertOverlay>        ← Full-face color bleed for alerts
 │
 ├── <VoiceTrigger>             ← Mic activation button + listener
 ├── <ThemeToggle>              ← Theme cycle button
 ├── <ModeQuickBar>             ← Optional tap shortcuts (hidden by default)
 └── <PermissionGate>           ← Wraps modes that need sensor access
```

---

## 🔩 Component-by-Component Breakdown

---

### `<WatchShell>`
**Role:** Root container. Owns theme state and mode state.

| Responsibility | Detail |
|---|---|
| Theme context | Provides current theme (colors, font) to all children via context |
| Mode state | Holds `currentMode` — passed down or via context |
| Layout | Centers the watch face, full mobile viewport |
| Safe area | Respects iOS/Android notch and bottom bar insets |

---

### `<WatchFace>`
**Role:** The circle. The canvas. Everything visual lives inside this.

| Responsibility | Detail |
|---|---|
| Shape | Perfect circle, SVG or `border-radius: 50%` div |
| Shadow | Subtle outer shadow — depth without clutter |
| Touch target | Long press → activate voice. Single tap → cycle mode |
| Size | `80vw` capped at `420px` — fills mobile, behaves on desktop |
| Overflow | Hidden — hands clip to the circle |

---

### `<WatchBezel>`
**Role:** The outer ring. Rotates and changes label set per mode.

| Responsibility | Detail |
|---|---|
| Default state | Clean ring, no text — just the edge |
| Navigation mode | Cardinal points appear (N, S, E, W) |
| Speed mode | Speed scale arc appears (0 → max speed) |
| AQI mode | Color gradient arc: green → yellow → red |
| Rotation | Rotates via CSS transform — anti-clockwise mode reverses this |
| Animation | Slow, deliberate rotate — 800ms ease-in-out |

---

### `<WatchDial>`
**Role:** The face interior. Background of the watch.

| Responsibility | Detail |
|---|---|
| Background | Theme color (white / black / cream / navy) |
| Numerals | Hidden by default. Fade in on World Clock mode only |
| Mode overlays | Hosts `<ModeOverlay>` — swapped on mode change |
| Tap gesture | Passes tap events up to `<WatchFace>` |

---

### `<ModeOverlay>`
**Role:** Visual layer that appears on the dial per mode. Swapped on mode switch.

Each mode gets its own overlay variant:

| Overlay Variant | What It Renders |
|---|---|
| `CompassOverlay` | Cardinal direction labels at N/S/E/W inside the face |
| `TempOverlay` | Two scale arcs — outdoor temp + body temp ranges |
| `AQIOverlay` | Single arc with AQI color fill |
| `SpeedOverlay` | Speed arc (0 → max), current speed numeric |
| `WorldClockOverlay` | City name + UTC offset text, minimal |
| `PlanetOverlay` | Planet name + faint star dots, darkened dial |
| `NullOverlay` | Nothing — idle clock mode |

**Transition:** Old overlay fades out, new one fades in. 300ms opacity. Hands animate simultaneously.

---

### `<CenterLabel>`
**Role:** The text at the center of the face. One job: say what mode is active.

| State | Display |
|---|---|
| Idle | Empty |
| Mode switching | Mode name fades in large → shrinks to small label at top |
| Listening | Animated `...` dots |
| Error | Small `⊘` symbol |

---

### `<WatchHands>`
**Role:** Container for all three hands. Manages their coordinated animations.

Owns the `rotationDegrees` for each hand, updated by:
- `useTime` hook (idle clock)
- Sensor hooks (compass, GPS, speed)
- Mode-specific calculations

---

### `<HourHand>` / `<MinuteHand>` / `<SecondsHand>`
**Role:** Individual animated SVG hand.

| Property | Detail |
|---|---|
| Shape | SVG path — slim, tapered, with lume dot near tip |
| Rotation origin | Center of watch face (`transform-origin: bottom center`) |
| Animation | Framer Motion `rotate` — always interpolates, never jumps |
| Color | Inherits from theme. Alert state overrides to red |
| Shake animation | Web Animations API — used for overspeed alert |
| Per-mode meaning | Documented in animation plan — each hand has a role per mode |

**SecondsHand specifics:**
- Continuous sweep (not tick-step)
- Thinner than hour/minute
- In non-clock modes: either hides or repurposed (e.g., live compass needle)

---

### `<CenterPin>`
**Role:** The small circle at the center where hands meet.

| State | Behaviour |
|---|---|
| Idle | Static dot |
| Listening | Slow pulse (scale 1 → 1.15 → 1) |
| Mode switching | Brief bright flash |
| Alert | Pulses red in sync with alert |

---

### `<StatusLine>`
**Role:** Single line of text below the watch face. The only place data is shown as text.

| Mode | What It Shows |
|---|---|
| Navigate | `"Heading: NNE — 240m"` |
| Compass | `"Facing: 047°"` |
| Temperature | `"22°C outside · ~36.4°C body"` |
| AQI | `"AQI 43 — Good"` |
| Speed | `"62 km/h · Limit: 60"` |
| World Clock | `"Tokyo — JST +9"` |
| Planet | `"Mars Sol — 14:22"` |
| Idle | Nothing, or current date |

**Animation:** Typewriter effect — characters appear one by one on mode entry.

---

### `<AlertOverlay>`
**Role:** Full-face color bleed that interrupts any mode for critical alerts.

| Alert Type | Colour | Behaviour |
|---|---|---|
| Overspeed | Red | Bleeds from center, pulses every 2s |
| Poor AQI (>150) | Amber | Slow pulse |
| High body temp | Warm orange | Steady tint |
| Arrival | Green | Single pulse, then clears |

Sits above all other components in z-order. Fades out when condition clears.

---

### `<VoiceTrigger>`
**Role:** The mic control. Activates listening and dispatches recognized commands.

| Sub-part | Detail |
|---|---|
| Trigger button | Minimal mic icon, bottom edge of screen |
| Listening indicator | Icon pulses while open |
| `useVoice` hook | Manages SpeechRecognition lifecycle |
| Command parser | Matches transcript to trigger map, extracts params |
| Fallback | If Speech API unavailable, button opens `<ModeQuickBar>` instead |

---

### `<ThemeToggle>`
**Role:** Cycles through themes on tap.

| Detail | Value |
|---|---|
| Position | Top-right corner, outside the watch face |
| Visual | Small circle filled with next theme's color — a preview dot |
| Tap | Triggers theme transition animation, updates context |
| Themes in order | Arctic → Void → Brass → Abyss → (loop) |

---

### `<ModeQuickBar>`
**Role:** Tap-based fallback mode switcher. Hidden unless voice is unavailable or user long-presses the status line.

| Detail | Value |
|---|---|
| Layout | Horizontal icon strip below the watch face |
| Icons | One per mode — minimal, outlined |
| Labels | Hidden by default, appear on hold |
| Dismissal | Tapping the watch face closes it |

---

### `<PermissionGate>`
**Role:** Wraps any mode that requires a sensor permission. Shows a prompt if not granted.

```
<PermissionGate requires="geolocation">
  <NavigateMode />
</PermissionGate>
```

| Behaviour | Detail |
|---|---|
| Granted | Renders children normally |
| Not yet asked | Shows the "May I use your location?" prompt on the watch face |
| Denied | Renders a locked state — small icon, no nagging |

---

## 🪝 Hooks — The Logic Layer

| Hook | What It Does |
|---|---|
| `useTime()` | Real-time clock → hand rotation degrees |
| `useCompass()` | DeviceOrientation → bearing in degrees |
| `useGeolocation()` | GPS coords + speed + heading |
| `useVoice()` | Web Speech API lifecycle + command parsing |
| `useWeather(lat, lon)` | Fetches `/api/weather`, returns temp data |
| `useAQI(lat, lon)` | Fetches `/api/aqi`, returns AQI + label |
| `useSpeedLimit(lat, lon)` | Fetches `/api/speedlimit`, returns road limit |
| `usePlanetaryTime(planet)` | Calculates current time on given planet |
| `useWorldClock(timezone)` | Returns current time in any timezone |
| `useTheme()` | Current theme, toggle function |
| `useMode()` | Current mode, setMode dispatcher |
| `useAlert()` | Alert state, trigger/dismiss functions |

---

## ✅ Full Planning Checklist — Complete

- [x] Overall concept
- [x] Platform & tech stack
- [x] Feature tiers
- [x] Visual design language
- [x] Themes
- [x] Animation system
- [x] Voice trigger system
- [x] API & data flow
- [x] PWA & permissions flow
- [x] **Component breakdown** ← just finished

---

## 🔜 Last Remaining: Deployment & Environment Setup

That's the final planning section — covers Vercel config, environment variables, API key setup, and the PWA manifest. Want to knock that out now, or are you ready to move into **design phase**?

## @thebenmerlin

No, let's cook more. I was thinking, let's make the mic icon into a mute and unmute mode, so we can keep talking into it, swapping modes and stuff. 

## Copilot

## Voice Trigger Redesign — Always-On Mic with Mute/Unmute

---

### 🎯 The Shift in Concept

> Before: Tap to activate → speaks → mic closes.
> Now: **Unmute once → it's always listening. You just talk.**

This changes the watch from a tool you *operate* to an instrument you *wear and speak to.* Much more natural. Much more like the watch has ears.

---

### 🔇/🔊 The Two States

| State | Icon | Watch Behaviour |
|---|---|---|
| **Muted** | 🎙️ with a line through it | Mic is fully closed. Watch is silent. Hands just tell time. |
| **Unmuted** | 🎙️ softly pulsing | Mic is open. Watch is always listening. You speak, it reacts instantly. |

---

### 🎨 Icon Animation Per State

| State | Animation |
|---|---|
| Muted | Static. Faded. Almost invisible — doesn't demand attention. |
| Unmuted (idle, listening) | Slow breathe pulse — scale 1.0 → 1.08 → 1.0, loop. Subtle. |
| Unmuted (hearing something) | Pulse quickens. Icon brightens slightly. |
| Unmuted (command recognised) | Single sharp flash, then returns to slow pulse. |
| Transitioning mute → unmute | Icon "cracks open" — short expand animation, then settles into pulse. |
| Transitioning unmute → mute | Pulse contracts inward, icon dims. Clean close. |

---

### 🗣️ Conversational Mode — What This Enables

Because the mic stays open, the user can now **chain commands naturally:**

```
"Navigate"         → switches to Navigation mode
  [30 seconds later]
"Temperature"      → switches to Temp mode, no tap needed
  [1 minute later]
"Time in Berlin"   → World Clock, no tap needed
  [whenever]
"Stop"             → returns to idle clock
```

It becomes a **conversation with the watch**, not a series of button presses.

---

### 🧠 Always-On Listening — Smart Handling

The mic being always open introduces problems. Here's how each one is handled:

| Problem | Solution |
|---|---|
| Background noise triggering commands | Confidence threshold stays at **0.75**. Only deliberate, clear speech triggers. |
| Battery drain from continuous mic | Use `SpeechRecognition` in **continuous mode** — it's event-driven, not polling. Low overhead. |
| Accidental triggers mid-conversation | Hotword sensitivity — only trigger on **known command words**, ignore all other speech. |
| Mic feedback / echo | Standard browser echo cancellation handles this natively. |
| Privacy concern (always-on mic) | **Muted by default on every load.** User explicitly unmutes. State is never persisted across sessions — always starts muted. |
| iOS background mic timeout | On iOS, mic closes if app goes to background. On return, watch detects this and shows a "tap to resume listening" prompt on the face — one tap, back to unmuted. |

---

### 🔁 Mute/Unmute Interaction Detail

| Interaction | Result |
|---|---|
| Tap mic icon (muted) | Unmutes. Browser mic permission prompt fires if first time. Listening begins. |
| Tap mic icon (unmuted) | Mutes instantly. Mic closes. Pulse animation stops. |
| App goes to background | Auto-mutes (iOS limitation + good practice). |
| App returns to foreground | Stays muted — user re-unmutes intentionally. |
| "Stop listening" voice command | Mutes the mic by voice — so you can go hands-free both ways. |

---

### 🆕 Updated Trigger Word — Mic by Voice

Two new commands added specifically for this system:

| Spoken | Action |
|---|---|
| `"Stop listening"` / `"Mute"` | Closes mic, icon dims |
| `"Start listening"` — *not needed, mic already open* | N/A |
| `"Reset"` / `"Home"` | Returns to idle clock, mic stays open |

---

### 📍 Icon Position — Reconsidered

With the mic being a persistent, always-visible control, its placement matters more now.

| Option | Pros | Cons |
|---|---|---|
| Bottom center, outside watch face | Thumb-friendly, obvious | Clutters the clean bottom edge |
| Bottom edge of the watch face circle itself | Feels integrated, elegant | Slightly harder tap target |
| **Top edge of the watch face circle** ✅ | Out of the way, not thumb-zone, feels like a crown | Slight reach on large phones |

**Recommendation:** Top edge of the watch circle — like the **crown of a watch**. Mic = the crown. You wind a watch with its crown. You activate this one with your voice. The metaphor is perfect.

---

### 🪝 Updated `useVoice()` Hook — New Responsibilities

```
useVoice()
 ├── isMuted (state)              ← muted by default
 ├── toggleMute()                 ← flips mic open/closed
 ├── isHearing (state)            ← true when audio detected
 ├── isRecognising (state)        ← true when processing transcript
 ├── lastCommand (state)          ← most recent matched command
 ├── startListening()             ← opens SpeechRecognition continuous
 ├── stopListening()              ← closes mic cleanly
 ├── onResult(transcript)         ← runs through trigger map
 ├── parseParameters(transcript)  ← extracts city, planet, etc.
 ├── dispatchMode(mode, params)   ← fires mode switch
 └── onError()                    ← handles mic drop / no signal
```

---

### ✅ What This Changes in the Component Plan

| Component | Update |
|---|---|
| `<VoiceTrigger>` | Now a **persistent toggle button**, not a one-shot trigger |
| `<CenterPin>` | Can mirror the mic's listening state — pulses in sync when unmuted |
| `<WatchShell>` | Owns `isMuted` state — passed to relevant children |
| `<StatusLine>` | Shows `"Listening..."` subtly when unmuted and idle |

---

### The Feel of It

Unmute the watch once in the morning. Put it in your pocket or leave it on the table.

Say *"Temperature"* — it shows temperature.
Say *"Navigate"* — hands point to your destination.
Say *"Planet Mars"* — the face darkens, hands show Mars time.
Say *"Mute"* — it goes quiet.

**That's the experience.** The mic icon isn't a button — it's a mode the watch lives in.

---

Want to keep cooking? We still have deployment/environment setup to plan, or we can start talking about the actual design — the watch face geometry, SVG anatomy, and how the hands are drawn and rotated.

## @thebenmerlin

Can you output the entire plan of the project, with the entire context, from design philosphy to api's to stack to everything. From the uploaded chat as well as what we've discussed here. 

## Copilot

# MechNav Watch — Complete Project Plan

---

## 🧭 Concept

A mobile-first Progressive Web App hosted on Vercel that looks, feels, and behaves like a mechanical analog watch — but responds to your voice. One word spoken, and the hands transform into a compass, speedometer, thermometer, AQI gauge, or planetary clock. The entire interface is a single watch face. No menus. No dashboards. Just hands that move with purpose.

> **Dead silence until you speak. Then the hands move. That's the whole UI.**

---

## 🎨 Design Philosophy

### The Aesthetic
- **Minimalist white circle** — pure white face, white hands with subtle shadow/outline
- Inspired by Braun and Apple Watch — function expressed through restraint
- No numerals by default. No clutter. The watch is calm at rest.
- When a mode activates, the face *becomes* that instrument — not a screen showing data about it

### Why Minimalist Wins
- Hands are more legible as a concept against a clean face
- Mode changes hit harder when the baseline is silence — a red bleed on a white face is dramatic
- Mobile-first and minimalist are natural allies — readable in sunlight, any screen size
- Theme toggling feels like a genuine feature, not an afterthought

### The Three Animation Laws
1. **Hands never teleport** — even a full 360° rotation is animated, never a jump
2. **Weight** — hands decelerate as they settle, they have mass
3. **Silence by default** — at rest, nothing moves except the seconds hand

---

## 🎨 Theme System

| Theme | Face | Hands | Accent |
|---|---|---|---|
| ⬜ Arctic | White | Off-white | Light grey |
| ⬛ Void | Deep black | White | Pure white |
| 🟫 Brass | Warm cream | Gold | Amber |
| 🔵 Abyss | Dark navy | Ice blue | Cyan |
| 🔴 Alert | Auto-triggered only | Red | Red — emergencies only |

**Theme change animation:**
```
Tap theme toggle
      ↓
1. Face ripple outward — like a stone dropped in water  (400ms)
2. Color bleeds from center tap point outward          (300ms)
3. Hands briefly disappear into the new color          (200ms)
4. Hands re-emerge in new theme color                  (300ms)
```
Not a CSS swap — it feels like dipping the watch in paint.

---

## 🎯 Feature Set

### Mode Table

| Trigger Word(s) | Mode | What the Hands Do |
|---|---|---|
| `"Navigate"` / `"Guide me"` | GPS Navigation | Hour hand = bearing to destination, Minute hand = current heading |
| `"North"` / `"South"` / `"East"` / `"West"` | Compass / Cardinal | Hands rotate to point in called direction relative to you |
| `"Temperature"` / `"Temp"` | Thermometer | Hour hand = outdoor temp, Minute hand = body temp estimate |
| `"Air"` / `"AQI"` / `"Breathe"` | Air Quality Index | Single hand sweeps gauge arc, bezel fills green → red |
| `"Time in [city/country]"` | World Clock | Hands re-set to show time in that timezone |
| `"Speed"` | Speedometer | Minute hand sweeps speed arc live, overspeed alert fires |
| `"Planet [name]"` | Planetary Time | Hands show current solar time on that planet |
| `"Reverse"` / `"Anti"` | Anti-Clockwise | All hands run counter-clockwise, face mirror-flips on entry |
| `"Reset"` / `"Home"` | Idle Clock | Returns to normal timekeeping, mic stays open |
| `"Theme"` / `"Change"` | Theme Cycle | Cycles to next theme with ripple animation |
| `"Stop"` / `"Pause"` | Freeze | Hands lock in current position |
| `"Mute"` / `"Stop listening"` | Mic off | Closes mic, icon dims |

---

## 🗣️ Voice System — Always-On Mic with Mute/Unmute

### The Core Shift
The mic is not a one-shot trigger. It is a **persistent mode** the watch lives in. Unmute once, and the watch listens continuously. You just talk. The watch responds. It becomes a conversation.

```
Morning: unmute once
  ↓
"Navigate"        → hands point to destination
"Temperature"     → hands become thermometer
"Time in Berlin"  → world clock, no tap needed
"Planet Mars"     → face darkens, hands show Mars time
"Mute"            → watch goes quiet
```

### Mic States

| State | Icon Behaviour | Watch Behaviour |
|---|---|---|
| **Muted** | Static, faded, almost invisible | Mic fully closed. Hands just tell time. |
| **Unmuted — idle** | Slow breathe pulse (scale 1.0 → 1.08 loop) | Open, waiting. Status line: *"Listening..."* |
| **Unmuted — hearing** | Pulse quickens, icon brightens | Audio detected, processing |
| **Command confirmed** | Single sharp flash, returns to slow pulse | Mode fires, animation begins |
| **Command failed** | — | Watch face micro-shudder |

### Mute/Unmute Interactions

| Interaction | Result |
|---|---|
| Tap mic icon (muted) | Unmutes, browser permission fires if first time |
| Tap mic icon (unmuted) | Mutes instantly, pulse stops |
| App goes to background | Auto-mutes |
| App returns to foreground | Stays muted — user re-unmutes intentionally |
| Say `"Mute"` | Mutes by voice — fully hands-free both ways |

### Mic Icon Placement
**Top edge of the watch circle** — like the crown of a mechanical watch. You wind a watch with its crown. You activate this one with your voice. The metaphor holds perfectly.

### Always-On Smart Handling

| Problem | Solution |
|---|---|
| Background noise false triggers | Confidence threshold minimum **0.75** |
| Misheard similar words | Only matches against known command word list |
| Battery drain | `SpeechRecognition` continuous mode is event-driven, not polling |
| Privacy (always-on) | **Muted by default on every load.** State never persisted across sessions. |
| iOS background mic timeout | On return to foreground, one-tap prompt to resume listening |

### Phrase Parsing

```
"Time in Tokyo"           → timezone: Asia/Tokyo
"Time in New York"        → timezone: America/New_York
"Planet Mars"             → planet: mars
"Show me Jupiter"         → planet: jupiter
"Navigate to the airport" → intent: navigate, query: "airport" (nearest)
"Guide me home"           → intent: navigate, query: "home"
```
Approach: simple keyword extraction + string `.includes()` against a lookup map. No heavy NLP needed — covers 90% of cases.

### Tap Fallback (when voice unavailable)
- Single tap → cycle modes
- Swipe up/down → switch mode families
- Long press → minimal icon-only mode picker
- Mic unavailable → small `⊘` icon, tap controls take over silently

---

## ✨ Animation System

### Mode Switch — Hero Animation
```
User says "Navigate"
        ↓
1. Word fades in at center      (200ms, opacity)
2. Hands spin rapidly inward    (300ms, like winding)
3. Brief pause — held tension   (150ms)
4. Hands swing to new position  (600ms, mechanical ease-out)
5. Word fades to small label    (300ms, shrinks to top of face)
```
~1.4 seconds total. Every mode change feels like pulling a crown and setting the watch.

### Always-On Idle Animations

| Element | Animation |
|---|---|
| Seconds hand | Continuous smooth sweep — mechanical, not tick-step |
| Face shadow | Very slow breathing pulse — barely noticeable |
| Center pin | Subtle micro-pulse every 60s |

### Per-Mode Animations

**Navigate:**
- Hour hand swings and locks to destination bearing
- Minute hand tracks heading live, smooth 60fps
- Recalculation: both hands spin inward, re-settle
- Arrival: hands converge at 12, face pulses green once

**Compass:**
- Hour hand slams to North — deliberate, firm
- Minute hand rotates live with device orientation
- Jitter dampening: only updates if heading changes >2°

**Speed:**
- Minute hand sweeps like a speedometer needle, real-time
- Bezel arc fills proportionally
- Overspeed: hand turns red, face bleeds red, hand shakes (haptic + visual)

**Temperature:**
- Both hands start at 6 (zero), rise slowly like mercury climbing
- Hour = outdoor, Minute = body — minute rises slightly faster

**AQI:**
- Single hand sweeps from 0 to value like a gauge
- Bezel gradient fills green → yellow → red
- AQI >150: arc pulses slowly — breathing warning

**World Clock:**
- Quick inward spin, then snap to correct time position

**Planetary Time:**
- Face darkens slightly, faint star dots appear
- Hands sweep slowly to planet's current "hour" — deep time feel
- Switching planets: hands wind back to 12, re-sweep

**Anti-Clockwise:**
- All hands reverse direction, smooth and eerie
- Face does a subtle horizontal mirror flip on entry
- If numerals visible, reverse order fades in

### Alert Animations (Priority Override)

| Alert | Animation |
|---|---|
| Overspeed | Red bleeds from center outward, hand shakes, haptic pulse every 2s |
| Poor AQI >150 | Face tints amber, bezel arc pulses |
| High body temp | Minute hand trembles, face warms to light orange |
| Arrival | Hands meet at 12, single clean white pulse, then idle |

### Text Animations

| Element | Animation |
|---|---|
| Mode name | Fade in large → shrink to small label at top of face |
| Status line | Typewriter — one character at a time on mode entry |
| Numeric readouts | Count up from 0 to value on entry |
| Listening indicator | Three dots in sequence: `.` `..` `...` |

---

## 🪐 Planetary Time — Math

Each planet has a solar day length. We calculate:
- Current Earth UTC time
- Map proportionally to planet's day length
- Express as "what time of day is it on [planet] right now"

| Planet | Solar Day |
|---|---|
| Mercury | 4,222.6 hours |
| Venus | 2,802 hours |
| Mars | 24h 37m |
| Jupiter | 9h 56m |
| Saturn | 10h 42m |
| Uranus | 17h 14m |
| Neptune | 16h 6m |

Powered by `astronomy-engine` npm package — fully client-side, no API.

---

## 📡 API & Data Architecture

### What Lives Where
```
Mobile Browser
      │
      ├── Sensors (direct — no server)
      │     ├── Geolocation API      → coords, speed, heading
      │     ├── DeviceOrientation    → compass bearing
      │     └── Web Speech API       → voice transcript
      │
      ├── Client-side Calculations (no server)
      │     ├── World Clock          → Intl.DateTimeFormat
      │     ├── Planetary Time       → astronomy-engine
      │     └── Anti-clockwise       → pure math
      │
      └── Vercel API Routes (server — keeps keys safe)
            ├── /api/weather         → OpenWeatherMap
            ├── /api/aqi             → OpenWeatherMap Air Pollution
            └── /api/speedlimit      → Overpass API / OSM
```

### API Routes

**`/api/weather`**
```
Input:  { lat, lon }
Output: { temp_c, temp_f, feels_like, condition }
Cache:  5 minutes
```

**`/api/aqi`**
```
Input:  { lat, lon }
Output: { aqi: 1–5, pm2_5, pm10, label }
Cache:  10 minutes
```

**`/api/speedlimit`**
```
Input:  { lat, lon }
Output: { limit_kmh, limit_mph, road_name }
Cache:  30 seconds
```

### Data Refresh Rates

| Data | Refresh | Why |
|---|---|---|
| GPS position | 1s | Navigation and speed need live |
| Compass heading | 100ms | Hands must feel responsive |
| Speed | 1s | GPS delta |
| Weather / Temp | 5 min | Slow-changing |
| AQI | 10 min | Slow-changing |
| Speed limit | 30s | Road changes as you move |
| World clock | 1s | It's a clock |
| Planetary time | 10s | Moves slowly |

### External APIs

| Feature | API | Cost |
|---|---|---|
| Outside Temperature | OpenWeatherMap | Free tier |
| Air Quality Index | OpenWeatherMap Air Pollution | Free tier |
| Speed Limits | OpenStreetMap Overpass API | Free |
| Routing / Directions | OpenRouteService | Free |
| World Timezones | `Intl.DateTimeFormat` built-in | None |
| Planetary Time | `astronomy-engine` (npm) | None |
| Voice | Web Speech API (browser) | None |
| Compass / GPS | DeviceOrientation + Geolocation | None |

**Total external API cost to start: $0.**

### Speed Alert Logic
```
1. Get current coords (Geolocation)
2. Query road speed limit via Overpass API
3. Compare device speed vs. limit
4. If speed > limit → red alert + haptic
5. If heading mismatches road direction → wrong-lane warning
```

### Error States

| Failure | Watch Behaviour |
|---|---|
| GPS unavailable | Hands stay at 12, small `⊘` on face |
| Weather API down | Temp hands don't appear, status: *"No signal"* |
| AQI API down | Arc doesn't render, single dash |
| Speed limit not found | Speed mode works, no overspeed alert — shown clearly |
| No internet | Server-dependent modes show *"Offline"*, local modes still work |

---

## 🧱 Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel-native, PWA support |
| Hosting | Vercel | Free tier, instant deploys, HTTPS automatic |
| Styling | Tailwind CSS + custom SVG | Fast utility styling, precise SVG control |
| Animation | Framer Motion | Hand rotations, mode switches, transitions |
| Alert animations | Web Animations API | Off main thread, performant shakes/pulses |
| Live tracking | `requestAnimationFrame` | 60fps compass and speed hand |
| Bezel arcs | SVG `stroke-dashoffset` | AQI and speed ring fill animations |
| Theme transitions | CSS Custom Properties | Interpolated color changes |
| Voice | Web Speech API | Browser-native, no cost |
| Astronomy | `astronomy-engine` npm | Client-side planetary calculations |
| Weather / AQI | OpenWeatherMap | Free tier, reliable |
| Maps / Roads | OpenStreetMap + Overpass | Free, no key needed |
| PWA | `next-pwa` | Service worker, installable |

---

## 🗂️ Project Structure

```
mechnavwatch/
├── app/
│   ├── page.tsx                    ← Main watch face
│   ├── layout.tsx
│   └── api/
│       ├── weather/route.ts        ← Temp proxy
│       ├── aqi/route.ts            ← AQI proxy
│       ├── speedlimit/route.ts     ← OSM speed limit
│       └── geocode/route.ts        ← Location → place name
│
├── components/
│   ├── WatchShell.tsx              ← Root, owns theme + mode state
│   ├── WatchFace.tsx               ← The circle, touch target
│   ├── WatchBezel.tsx              ← Outer ring, rotates per mode
│   ├── WatchDial.tsx               ← Inner face, hosts overlays
│   ├── WatchHands.tsx              ← Container for all three hands
│   ├── HourHand.tsx                ← SVG animated hand
│   ├── MinuteHand.tsx              ← SVG animated hand
│   ├── SecondsHand.tsx             ← Continuous sweep hand
│   ├── CenterPin.tsx               ← Center dot, pulses with mic state
│   ├── CenterLabel.tsx             ← Mode name display
│   ├── ModeOverlay.tsx             ← Per-mode visual layer (swapped)
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
│   ├── ThemeToggle.tsx             ← Preview dot, cycles themes
│   ├── ModeQuickBar.tsx            ← Tap fallback icon strip
│   └── PermissionGate.tsx          ← Wraps sensor-dependent modes
│
├── hooks/
│   ├── useTime.ts                  ← Real-time clock → hand degrees
│   ├── useCompass.ts               ← DeviceOrientation → bearing
│   ├── useGeolocation.ts           ← GPS coords, speed, heading
│   ├── useVoice.ts                 ← Web Speech API, mute/unmute, dispatch
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
│   ├── voiceCommands.ts            ← Trigger map + phrase parser
│   ├── planetaryTime.ts            ← Planet day lengths + math
│   ├── worldClock.ts               ← Country/city → IANA timezone
│   └── speedAlert.ts               ← Speed vs. limit logic
│
└── public/
    └── manifest.json               ← PWA manifest
```

---

## 🧩 Component Responsibilities (Summary)

| Component | One-Line Role |
|---|---|
| `WatchShell` | Root — owns theme and mode context |
| `WatchFace` | The circle — touch target, clips overflow |
| `WatchBezel` | Outer ring — rotates, shows mode-specific scale/labels |
| `WatchDial` | Inner face — hosts overlays, passes tap events |
| `ModeOverlay` | Swappable visual layer — one per mode |
| `CenterLabel` | Mode name — fades in large, shrinks to label |
| `WatchHands` | Coordinates all three hand rotations |
| `HourHand / MinuteHand / SecondsHand` | Individual SVG hands — animated, color-aware |
| `CenterPin` | Center dot — pulses with mic/alert state |
| `StatusLine` | One line of text data — typewriter entry |
| `AlertOverlay` | Full-face color bleed — z-top, non-destructive |
| `VoiceTrigger` | Persistent mute/unmute toggle — crown position |
| `ThemeToggle` | Preview dot — tap to cycle themes |
| `ModeQuickBar` | Icon strip fallback — hidden unless voice unavailable |
| `PermissionGate` | Wraps sensor modes — shows prompt if permission needed |

---

## 🪝 Hook Responsibilities (Summary)

| Hook | Feeds Into |
|---|---|
| `useTime` | Idle hand rotation |
| `useCompass` | Compass / North mode hand position |
| `useGeolocation` | Navigate, Speed, Temp, AQI modes |
| `useVoice` | Mode dispatcher, mute state, command parsing |
| `useWeather` | Temperature overlay data |
| `useAQI` | AQI overlay + bezel arc fill |
| `useSpeedLimit` | Overspeed alert logic |
| `usePlanetaryTime` | Planetary overlay hand position |
| `useWorldClock` | World clock hand position |
| `useTheme` | All components via context |
| `useMode` | All components via context |
| `useAlert` | AlertOverlay, hand color override |

---

## 🔐 Permissions Strategy

**Golden rule: never ask on load. Ask at the moment the feature is first used.**

| Permission | Triggered By | If Denied |
|---|---|---|
| 📍 Location | Navigate, Speed, Temp, AQI first use | Those modes disabled silently |
| 🎙️ Microphone | First tap of mic icon | Tap-only mode, never re-asked |
| 📡 Motion/Orientation | First Compass use | Compass disabled, message shown |
| 📷 Camera | Body temp feature | Feature hidden, never re-asked |

Ask once. Accept the answer. Never re-prompt uninvited.

---

## 📲 PWA Setup

- Installable via "Add to Home Screen" on iOS and Android
- Subtle install prompt after 30 seconds of use — not aggressive
- Standalone mode: no browser bar, full screen, feels native
- Service Worker: caches UI shell for offline — local modes still work
- HTTPS: Vercel provides this automatically — all sensor APIs work

---

## 📋 Development Phases

### Phase 1 — Foundation
- [ ] SVG watch face with working analog hands
- [ ] Voice system with mute/unmute toggle
- [ ] Command parser + mode dispatcher
- [ ] World time (no API, pure Intl)
- [ ] Anti-clockwise mode
- [ ] Theme toggle + all four themes
- [ ] PWA manifest + installable

### Phase 2 — Sensors & Environment
- [ ] Compass / Cardinal directions (DeviceOrientation)
- [ ] GPS Navigation mode (Geolocation + OpenRouteService)
- [ ] Outside temperature (OpenWeatherMap)
- [ ] AQI display (OpenWeatherMap Air Pollution)
- [ ] Hand animation transitions between modes

### Phase 3 — Motion & Speed
- [ ] Speedometer mode (GPS velocity)
- [ ] Speed limit lookup (OSM Overpass)
- [ ] Overspeed alert (haptic + visual)
- [ ] Wrong-lane detection (heading + road geometry)

### Phase 4 — Planetary & Polish
- [ ] Planetary time (all 7 planets)
- [ ] Body temperature (BLE Bluetooth Web API — Phase 2 hardware)
- [ ] Offline mode caching (Service Worker)
- [ ] Full animation polish
- [ ] Sound design (optional — subtle mechanical clicks)

---

## ⚠️ Known Constraints

| Constraint | Detail |
|---|---|
| HTTPS required | All sensor APIs need it — Vercel handles automatically ✅ |
| iOS DeviceOrientation | Requires user permission prompt on iOS 13+ |
| Web Speech API on iOS | Limited on Safari — tap fallback always available |
| Body temperature | No native mobile sensor — BLE device required for accuracy |
| Speed limit data | OSM crowd-sourced — may be missing on some roads |
| Background running | iOS PWA can't run in background — screen must stay on |
| Voice + background | Mic auto-closes when app is backgrounded on iOS |

---

## ✅ Planning Checklist

- [x] Core concept
- [x] Platform strategy
- [x] Feature set + trigger word map
- [x] Visual / design philosophy
- [x] Theme system
- [x] Animation system (all modes + alerts + theme)
- [x] Voice system — always-on mic, mute/unmute
- [x] API & data flow architecture
- [x] PWA & permissions strategy
- [x] Full component breakdown
- [x] Hook layer
- [x] Project structure
- [x] Tech stack
- [x] Development phases
- [ ] **Deployment & environment setup** ← one section remaining

---

That's the full plan, end to end. The only planning section not yet covered is deployment and environment setup — Vercel config, environment variables, API key management. Want to knock that out, or are you ready to cross into the design phase?
