'use client'

import { useMode } from '@/context/ModeContext'
import { useTime } from '@/hooks/useTime'
import { useWorldClock } from '@/hooks/useWorldClock'
import { getPlanetaryTime } from '@/lib/planetaryTime'
import { useMemo } from 'react'
import WatchHand from './WatchHand'

interface WatchHandsProps {
  compassBearing?: number | null
  frozenDegrees?: { hour: number; minute: number; second: number }
}

export default function WatchHands({ compassBearing, frozenDegrees }: WatchHandsProps) {
  const { mode, params } = useMode()
  const clockDeg = useTime()
  const worldClock = useWorldClock(mode === 'worldclock' ? params.timezone : undefined)

  const planetaryTime = useMemo(() => {
    if (mode !== 'planet' || !params.planet) return null
    return getPlanetaryTime(params.planet)
  }, [mode, params.planet])

  let hourDeg = clockDeg.hour
  let minuteDeg = clockDeg.minute
  let secondDeg = clockDeg.second
  let showSecond = true

  if (mode === 'freeze' && frozenDegrees) {
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
    // Hour hand locks to North (0°), minute hand = device bearing
    // Direction params offset the bearing
    const directionOffset =
      params.direction === 'north' ? 0
      : params.direction === 'south' ? 180
      : params.direction === 'east' ? 90
      : params.direction === 'west' ? 270
      : 0
    hourDeg = directionOffset      // points to called direction
    minuteDeg = compassBearing     // your current facing
    secondDeg = clockDeg.second
    showSecond = false
  }

  return (
    <g>
      <WatchHand degrees={hourDeg} length={0.55} width={3.5} hasLumeDot />
      <WatchHand degrees={minuteDeg} length={0.78} width={2.5} hasLumeDot />
      {showSecond && (
        <WatchHand
          degrees={secondDeg}
          length={0.85}
          width={1}
          color="var(--accent)"
          hasLumeDot={false}
          shadow={false}
        />
      )}
    </g>
  )
}
