'use client'

import { motion } from 'framer-motion'

// Temperature arc matches tempToMinuteDeg() in WatchHands.tsx:
// -20°C = 135° (4-5 o'clock), 50°C = 405° (1-2 o'clock), 270° clockwise sweep.

interface TempOverlayProps {
  outdoorC?: number | null
}

function tempColor(c: number): string {
  if (c <= 0)  return '#4499ff'   // blue — freezing
  if (c <= 15) return '#00ccbb'   // teal — cool
  if (c <= 25) return '#44cc44'   // green — comfortable
  if (c <= 35) return '#ff9900'   // orange — warm
  return '#ff3300'                // red — hot
}

const CX = 100, CY = 100, R = 72

function ptOnArc(clockDeg: number, radius = R): [number, number] {
  const rad = ((clockDeg - 90) * Math.PI) / 180
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)]
}

// 270° track: -20°C = 135° → 50°C = 405° (same large-arc as AQIOverlay)
const [x1, y1] = ptOnArc(135)
const [x2, y2] = ptOnArc(405)
const TRACK_PATH = `M ${x1} ${y1} A ${R} ${R} 0 1 1 ${x2} ${y2}`

const TEMP_TICKS = [-20, 0, 10, 20, 30, 40, 50].map((c) => {
  const deg = 135 + ((c - (-20)) / 70) * 270
  const [ox, oy] = ptOnArc(deg, R)
  const [ix, iy] = ptOnArc(deg, R - 7)
  const [lx, ly] = ptOnArc(deg, R - 14)
  return { c, ox, oy, ix, iy, lx, ly }
})

export default function TempOverlay({ outdoorC }: TempOverlayProps) {
  const hasTemp = outdoorC !== null && outdoorC !== undefined
  const safeC = outdoorC ?? 0
  const filled = Math.min(Math.max((safeC - (-20)) / 70, 0), 1)

  return (
    <g opacity={0.85}>
      {/* Background arc track */}
      <path d={TRACK_PATH} fill="none" stroke="var(--bezel-border)" strokeWidth={5} strokeLinecap="round" />

      {/* Animated fill arc colored by temperature */}
      {hasTemp && (
        <motion.path
          d={TRACK_PATH}
          fill="none"
          stroke={tempColor(safeC)}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}

      {/* Tick marks + scale labels */}
      {TEMP_TICKS.map(({ c, ox, oy, ix, iy, lx, ly }) => (
        <g key={c}>
          <line
            x1={ix} y1={iy} x2={ox} y2={oy}
            stroke="var(--text-secondary)"
            strokeWidth={c === 0 ? 1.5 : 0.8}
          />
          <text
            x={lx} y={ly + 1.5}
            textAnchor="middle"
            fontSize="4"
            fill={c === 0 ? 'var(--accent)' : 'var(--text-secondary)'}
            fontFamily="var(--font-mono)"
          >
            {c > 0 ? `+${c}` : `${c}`}
          </text>
        </g>
      ))}

      {/* Current temperature readout */}
      {hasTemp && (
        <text
          x={100} y={120}
          textAnchor="middle"
          fontSize="8"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
        >
          {Math.round(safeC)}°C
        </text>
      )}
    </g>
  )
}
