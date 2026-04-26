'use client'

const STAR_POSITIONS = [
  { x: 55, y: 45 }, { x: 142, y: 38 }, { x: 165, y: 75 },
  { x: 38, y: 120 }, { x: 160, y: 130 }, { x: 75, y: 160 },
  { x: 130, y: 155 }, { x: 48, y: 68 }, { x: 152, y: 58 },
]

interface PlanetOverlayProps {
  planet?: string
  timeLabel?: string
  timeFactor?: number  // >1 = faster than Earth, <1 = slower
}

function formatDilation(f: number): string {
  if (f > 0.95 && f < 1.05) return '≈ EARTH TIME'
  if (f >= 1.05) {
    const x = f < 10 ? f.toFixed(1) : Math.round(f)
    return `×${x} FASTER`
  }
  // f < 0.95: invert and show as "slower"
  const inv = 1 / f
  const x = inv < 10 ? inv.toFixed(1) : Math.round(inv)
  return `×${x} SLOWER`
}

export default function PlanetOverlay({ planet, timeLabel, timeFactor }: PlanetOverlayProps) {
  return (
    <g>
      {/* Star dots */}
      {STAR_POSITIONS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={0.8} fill="var(--accent)" opacity={0.5} />
      ))}

      {planet && (
        <text
          x={100}
          y={122}
          textAnchor="middle"
          fontSize="7"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
          letterSpacing="2"
        >
          {planet.toUpperCase()}
        </text>
      )}
      {timeLabel && (
        <text
          x={100}
          y={135}
          textAnchor="middle"
          fontSize="9"
          fill="var(--accent)"
          fontFamily="var(--font-mono)"
        >
          {timeLabel}
        </text>
      )}
      {timeFactor !== undefined && (
        <text
          x={100}
          y={148}
          textAnchor="middle"
          fontSize="5.5"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
          opacity={0.75}
        >
          {formatDilation(timeFactor)}
        </text>
      )}
    </g>
  )
}
