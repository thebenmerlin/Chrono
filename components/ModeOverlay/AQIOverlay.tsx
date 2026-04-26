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

// Full 270° track path (7-o'clock → 5-o'clock going clockwise)
const TRACK_PATH = (() => {
  const cx = 100, cy = 100, r = 72
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const pts = (deg: number) => [cx + r * Math.cos(toRad(deg)), cy + r * Math.sin(toRad(deg))]
  const [x1, y1] = pts(135)
  const [x2, y2] = pts(405)
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
})()

export default function AQIOverlay({ aqi, label }: AQIOverlayProps) {
  const safeAqi = aqi ?? 0
  const filled = Math.min(safeAqi / 500, 1)

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
      {/* Center readout */}
      <text
        x={100} y={98}
        textAnchor="middle"
        fontSize="14"
        fill="var(--text-primary)"
        fontFamily="var(--font-mono)"
        fontWeight="bold"
      >
        {safeAqi > 0 ? safeAqi : '—'}
      </text>
      {label && (
        <text
          x={100} y={112}
          textAnchor="middle"
          fontSize="6"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
        >
          {label}
        </text>
      )}
    </g>
  )
}
