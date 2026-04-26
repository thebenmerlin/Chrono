'use client'

import { useMode } from '@/context/ModeContext'
import { useCompass } from '@/hooks/useCompass'
import WatchHands from './WatchHands'
import CenterPin from './CenterPin'
import CenterLabel from './CenterLabel'
import ModeOverlay from './ModeOverlay'
import AlertOverlay from './AlertOverlay'
import type { AlertState } from '@/hooks/useAlert'
import { motion } from 'framer-motion'

interface WatchFaceProps {
  isMuted: boolean
  isHearing: boolean
  isRecognising: boolean
  alert: AlertState
  onTap: () => void
  outdoorC?: number | null
  bodyC?: number | null
  aqi?: number | null
  aqiLabel?: string | null
  speedKmh?: number | null
  limitKmh?: number | null
}

export default function WatchFace({
  isMuted,
  isHearing,
  isRecognising,
  alert,
  onTap,
  outdoorC,
  bodyC,
  aqi,
  aqiLabel,
  speedKmh,
  limitKmh,
}: WatchFaceProps) {
  const { mode } = useMode()
  const compass = useCompass()

  const isDark = mode === 'planet'

  return (
    <div
      className="relative select-none"
      style={{ width: 'min(80vw, 380px)', height: 'min(80vw, 380px)' }}
      onClick={onTap}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Bezel ring */}
        <circle
          cx={100}
          cy={100}
          r={98}
          fill="var(--bezel-bg)"
          stroke="var(--bezel-border)"
          strokeWidth={1.5}
          style={{
            filter: `drop-shadow(0 4px 24px var(--face-shadow))`,
          }}
        />

        {/* Face */}
        <motion.circle
          cx={100}
          cy={100}
          r={88}
          fill="var(--face-bg)"
          animate={{ opacity: isDark ? 0.85 : 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Mode overlay (drawn before hands so hands are on top) */}
        <ModeOverlay
          outdoorC={outdoorC}
          bodyC={bodyC}
          aqi={aqi}
          aqiLabel={aqiLabel}
          speedKmh={speedKmh}
          limitKmh={limitKmh}
        />

        {/* Tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          const angle = (i * 6 * Math.PI) / 180
          const isHour = i % 5 === 0
          const r1 = isHour ? 82 : 84
          const r2 = 87
          return (
            <line
              key={i}
              x1={100 + r1 * Math.sin(angle)}
              y1={100 - r1 * Math.cos(angle)}
              x2={100 + r2 * Math.sin(angle)}
              y2={100 - r2 * Math.cos(angle)}
              stroke="var(--bezel-border)"
              strokeWidth={isHour ? 1.2 : 0.5}
              opacity={0.7}
            />
          )
        })}

        {/* Hands */}
        <WatchHands compassBearing={compass.bearing} />

        {/* Center label */}
        <CenterLabel mode={mode} isListening={!isMuted && isHearing} />

        {/* Center pin */}
        <CenterPin
          isMuted={isMuted}
          isHearing={isHearing}
          alertActive={alert.active}
        />

        {/* Alert overlay (z-top) */}
        <AlertOverlay alert={alert} />
      </svg>
    </div>
  )
}
