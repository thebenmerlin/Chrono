'use client'

interface WorldClockOverlayProps {
  city?: string
  utcOffset?: string
}

export default function WorldClockOverlay({ city, utcOffset }: WorldClockOverlayProps) {
  return (
    <g opacity={0.7}>
      {city && (
        <text
          x={100}
          y={130}
          textAnchor="middle"
          fontSize="7"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
          letterSpacing="1"
        >
          {city.toUpperCase()}
        </text>
      )}
      {utcOffset && (
        <text
          x={100}
          y={142}
          textAnchor="middle"
          fontSize="6"
          fill="var(--accent)"
          fontFamily="var(--font-mono)"
        >
          {utcOffset}
        </text>
      )}
    </g>
  )
}
