'use client'

import { motion } from 'framer-motion'
import { getSpeedAlertLevel, speedArcColor } from '@/lib/speedAlert'

interface SpeedOverlayProps {
  speedKmh?: number | null
  limitKmh?: number | null
}

// 300° clockwise arc from 7-o'clock (210°) to 5-o'clock (150°), radius 72
// Precomputed endpoints: start (64, 162.35) → end (136, 162.35)
const TRACK_PATH = 'M 64 162.35 A 72 72 0 1 1 136 162.35'

export default function SpeedOverlay({ speedKmh, limitKmh }: SpeedOverlayProps) {
  const speed = speedKmh ?? 0
  const maxSpeed = limitKmh ? Math.max(limitKmh * 1.5, 120) : 180
  const filled = Math.min(speed / maxSpeed, 1)
  const level = getSpeedAlertLevel(speed, limitKmh ?? null)
  const arcColor = speedArcColor(level, limitKmh != null)

  return (
    <g opacity={0.85}>
      {/* Background track */}
      <path
        d={TRACK_PATH}
        fill="none"
        stroke="var(--bezel-border)"
        strokeWidth={5}
        strokeLinecap="round"
      />

      {/* Animated speed arc */}
      <motion.path
        d={TRACK_PATH}
        fill="none"
        stroke={arcColor}
        strokeWidth={5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: filled }}
        transition={{ type: 'spring', stiffness: 60, damping: 20, mass: 0.8 }}
      />

      {/* Scale labels: 0 · mid · max */}
      <text x={36} y={150} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">0</text>
      <text x={100} y={28} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
        {Math.round(maxSpeed / 2)}
      </text>
      <text x={164} y={150} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
        {Math.round(maxSpeed)}
      </text>

      {/* Speed readout */}
      <text x={100} y={98} textAnchor="middle" fontSize="16" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="bold">
        {Math.round(speed)}
      </text>
      <text x={100} y={112} textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
        km/h
      </text>

      {/* Speed limit badge */}
      {limitKmh && (
        <>
          <circle
            cx={140} cy={132} r={11}
            fill="white"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <text x={140} y={136} textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="var(--font-mono)" fontWeight="bold">
            {limitKmh}
          </text>
        </>
      )}
    </g>
  )
}
