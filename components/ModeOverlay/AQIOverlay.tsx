'use client'

import { motion } from 'framer-motion'

interface AQIOverlayProps {
  aqi?: number | null        // 0–500 EPA scale
  label?: string | null
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#99004c'
  return '#7e0023'
}

const CX = 100, CY = 100, R = 72

function ptOnArc(clockDeg: number, radius = R): [number, number] {
  const rad = ((clockDeg - 90) * Math.PI) / 180
  return [CX + radius * Math.cos(rad), CY + radius * Math.sin(rad)]
}

// Full 270° track path: AQI 0 = 135° (4:30), AQI 500 = 405° = 45° (1:30) — must match aqiToMinuteDeg()
const [x1, y1] = ptOnArc(135)
const [x2, y2] = ptOnArc(405)
const TRACK_PATH = `M ${x1} ${y1} A ${R} ${R} 0 1 1 ${x2} ${y2}`

// Tick marks at AQI 0, 100, 200, 300, 400, 500
const AQI_TICKS = [0, 100, 200, 300, 400, 500].map((v) => {
  const deg = 135 + (v / 500) * 270
  const [ox, oy] = ptOnArc(deg, R)
  const [ix, iy] = ptOnArc(deg, R - 7)
  const [lx, ly] = ptOnArc(deg, R - 13)
  return { v, ox, oy, ix, iy, lx, ly }
})

export default function AQIOverlay({ aqi, label }: AQIOverlayProps) {
  const safeAqi = aqi ?? 0
  const filled = Math.min(safeAqi / 500, 1)

  return (
    <g opacity={0.85}>
      {/* Background track */}
      <path d={TRACK_PATH} fill="none" stroke="var(--bezel-border)" strokeWidth={5} strokeLinecap="round" />

      {/* Animated fill arc */}
      {safeAqi > 0 && (
        <motion.path
          d={TRACK_PATH}
          fill="none"
          stroke={aqiColor(safeAqi)}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      )}

      {/* Tick marks + scale labels */}
      {AQI_TICKS.map(({ v, ox, oy, ix, iy, lx, ly }) => (
        <g key={v}>
          <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="var(--text-secondary)" strokeWidth={v % 200 === 0 ? 1.2 : 0.7} />
          <text
            x={lx} y={ly + 1.5}
            textAnchor="middle"
            fontSize="4"
            fill="var(--text-secondary)"
            fontFamily="var(--font-mono)"
          >
            {v}
          </text>
        </g>
      ))}

      {/* AQI value — tucked below center so hand can point freely */}
      <text x={100} y={120} textAnchor="middle" fontSize="8" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
        {safeAqi > 0 ? `AQI ${safeAqi}` : '—'}
      </text>
      {label && (
        <text x={100} y={130} textAnchor="middle" fontSize="5.5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          {label}
        </text>
      )}
    </g>
  )
}
