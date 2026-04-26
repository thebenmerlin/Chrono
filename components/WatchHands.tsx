'use client'

import { useMode } from '@/context/ModeContext'
import { useTime } from '@/hooks/useTime'
import { useWorldClock } from '@/hooks/useWorldClock'
import { useModeTransition } from '@/hooks/useModeTransition'
import { getPlanetaryTime } from '@/lib/planetaryTime'
import { getSpeedAlertLevel } from '@/lib/speedAlert'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import WatchHand from './WatchHand'

interface WatchHandsProps {
  compassBearing?: number | null
  geoHeading?: number | null
  outdoorC?: number | null
  aqi?: number | null
  speedKmh?: number | null
  limitKmh?: number | null
  frozenDegrees?: { hour: number; minute: number; second: number }
}

// Map outdoor temp (-20 to 50°C) onto the same 270° arc as AQI:
// -20°C = 135° (4-5 o'clock), 50°C = 405° (1-2 o'clock)
// Must match TempOverlay arc track.
function tempToMinuteDeg(c: number): number {
  const TEMP_MIN = -20, TEMP_MAX = 50
  const clamped = Math.max(TEMP_MIN, Math.min(TEMP_MAX, c))
  return 135 + ((clamped - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)) * 270
}

// Map AQI (0–500) onto the 270° arc track drawn in AQIOverlay:
// AQI 0 = 135° (4-5 o'clock start), AQI 500 = 405° (1-2 o'clock end)
function aqiToMinuteDeg(aqi: number): number {
  const clamped = Math.max(0, Math.min(500, aqi))
  return 135 + (clamped / 500) * 270
}

// Map speed to minute hand degrees: 0 km/h = 210° (7-o'clock), max = 510° (5-o'clock)
// Continuous increasing values so Framer Motion always animates clockwise
function speedToMinuteDeg(kmh: number, maxKmh: number): number {
  const clamped = Math.max(0, Math.min(maxKmh, kmh))
  return 210 + (clamped / maxKmh) * 300
}

export default function WatchHands({
  compassBearing,
  geoHeading,
  outdoorC,
  aqi,
  speedKmh,
  limitKmh,
  frozenDegrees,
}: WatchHandsProps) {
  const { mode, params } = useMode()
  const clockDeg = useTime()
  const worldClock = useWorldClock(mode === 'worldclock' ? params.timezone : undefined)
  const { phase } = useModeTransition(mode)

  const planetaryTime = useMemo(() => {
    if (mode !== 'planet' || !params.planet) return null
    return getPlanetaryTime(params.planet)
  }, [mode, params.planet])

  const inTransition = phase === 'spin-in' || phase === 'hold'

  let hourDeg = clockDeg.hour
  let minuteDeg = clockDeg.minute
  let secondDeg = clockDeg.second
  let showSecond = true

  if (inTransition) {
    hourDeg = 0
    minuteDeg = 0
    secondDeg = 0
  } else if (mode === 'freeze' && frozenDegrees) {
    hourDeg = frozenDegrees.hour
    minuteDeg = frozenDegrees.minute
    secondDeg = frozenDegrees.second
  } else if (mode === 'worldclock' && worldClock) {
    hourDeg = worldClock.hour
    minuteDeg = worldClock.minute
    secondDeg = worldClock.second
  } else if (mode === 'planet' && planetaryTime) {
    hourDeg = planetaryTime.hourDeg
    minuteDeg = planetaryTime.minuteDeg
    secondDeg = 0
    showSecond = false
  } else if (mode === 'compass' && compassBearing !== null && compassBearing !== undefined) {
    const directionOffset =
      params.direction === 'north' ? 0
      : params.direction === 'south' ? 180
      : params.direction === 'east' ? 90
      : params.direction === 'west' ? 270
      : 0
    hourDeg = directionOffset
    minuteDeg = compassBearing
    showSecond = false
  } else if (mode === 'navigate') {
    hourDeg = compassBearing ?? clockDeg.hour
    minuteDeg = geoHeading ?? clockDeg.minute
    showSecond = false
  } else if (mode === 'temperature' && outdoorC !== null && outdoorC !== undefined) {
    hourDeg = 0  // parked at 12 behind center pin
    minuteDeg = tempToMinuteDeg(outdoorC)
    showSecond = false
  } else if (mode === 'aqi' && aqi !== null && aqi !== undefined) {
    // Hour hand stays at 12 (hidden behind pin), minute hand is the gauge needle
    hourDeg = 0
    minuteDeg = aqiToMinuteDeg(aqi)
    showSecond = false
  } else if (mode === 'speed') {
    const maxSpeed = limitKmh ? Math.max(limitKmh * 1.5, 120) : 180
    hourDeg = clockDeg.hour  // hour hand stays on clock time
    minuteDeg = speedToMinuteDeg(speedKmh ?? 0, maxSpeed)
    showSecond = false
  }

  const handTransition = inTransition
    ? { type: 'spring' as const, stiffness: 260, damping: 20, mass: 0.6 }
    : { type: 'spring' as const, stiffness: 60, damping: 16, mass: 1.4 }

  // Shake minute hand when overspeed danger
  const isOverspeed = mode === 'speed' && getSpeedAlertLevel(speedKmh ?? 0, limitKmh ?? null) === 'danger'

  return (
    <g>
      <WatchHand
        degrees={hourDeg}
        length={0.55}
        width={3.5}
        hasLumeDot
        transition={handTransition}
      />
      <motion.g
        animate={isOverspeed ? { x: [0, -1.5, 1.5, -1.5, 1.5, 0] } : { x: 0 }}
        transition={isOverspeed ? { duration: 0.35, repeat: Infinity } : { duration: 0 }}
      >
        <WatchHand
          degrees={minuteDeg}
          length={0.78}
          width={2.5}
          hasLumeDot
          transition={handTransition}
        />
      </motion.g>
      {showSecond && (
        <WatchHand
          degrees={secondDeg}
          length={0.85}
          width={1}
          color="var(--accent)"
          hasLumeDot={false}
          shadow={false}
          transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.4 }}
        />
      )}
    </g>
  )
}
