'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useMode } from '@/context/ModeContext'
import NullOverlay from './NullOverlay'
import CompassOverlay from './CompassOverlay'
import TempOverlay from './TempOverlay'
import AQIOverlay from './AQIOverlay'
import SpeedOverlay from './SpeedOverlay'
import WorldClockOverlay from './WorldClockOverlay'
import PlanetOverlay from './PlanetOverlay'
import { useWorldClock } from '@/hooks/useWorldClock'
import { getPlanetaryTime } from '@/lib/planetaryTime'
import { useMemo } from 'react'

interface ModeOverlayProps {
  outdoorC?: number | null
  aqi?: number | null
  aqiLabel?: string | null
  speedKmh?: number | null
  limitKmh?: number | null
}

export default function ModeOverlay({ outdoorC, aqi, aqiLabel, speedKmh, limitKmh }: ModeOverlayProps) {
  const { mode, params } = useMode()
  const worldClock = useWorldClock(mode === 'worldclock' ? params.timezone : undefined)

  const planetTime = useMemo(() => {
    if (mode !== 'planet' || !params.planet) return null
    return getPlanetaryTime(params.planet)
  }, [mode, params.planet])

  function renderOverlay() {
    switch (mode) {
      case 'compass':
      case 'navigate':
        return <CompassOverlay />
      case 'temperature':
        return <TempOverlay outdoorC={outdoorC} />
      case 'aqi':
        return <AQIOverlay aqi={aqi} label={aqiLabel} />
      case 'speed':
        return <SpeedOverlay speedKmh={speedKmh} limitKmh={limitKmh} />
      case 'worldclock':
        return <WorldClockOverlay city={worldClock?.cityLabel} utcOffset={worldClock?.utcOffset} />
      case 'planet':
        return <PlanetOverlay planet={params.planet} timeLabel={planetTime?.label} />
      default:
        return <NullOverlay />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.g
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderOverlay()}
      </motion.g>
    </AnimatePresence>
  )
}
