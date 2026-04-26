'use client'

const STAR_POSITIONS = [
  { x: 55, y: 45 }, { x: 142, y: 38 }, { x: 165, y: 75 },
  { x: 38, y: 120 }, { x: 160, y: 130 }, { x: 75, y: 160 },
  { x: 130, y: 155 }, { x: 48, y: 68 }, { x: 152, y: 58 },
]

interface PlanetOverlayProps {
  planet?: string
  timeLabel?: string
}

export default function PlanetOverlay({ planet, timeLabel }: PlanetOverlayProps) {
  return (
    <g>
      {/* Star dots */}
      {STAR_POSITIONS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={0.8} fill="var(--accent)" opacity={0.5} />
      ))}

      {planet && (
        <text
          x={100}
          y={128}
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
          y={141}
          textAnchor="middle"
          fontSize="9"
          fill="var(--accent)"
          fontFamily="var(--font-mono)"
        >
          {timeLabel}
        </text>
      )}
    </g>
  )
}
