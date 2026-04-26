'use client'

interface SpeedOverlayProps {
  speedKmh?: number | null
  limitKmh?: number | null
}

export default function SpeedOverlay({ speedKmh, limitKmh }: SpeedOverlayProps) {
  const maxSpeed = limitKmh ? Math.max(limitKmh * 1.5, 120) : 120
  const speed = speedKmh ?? 0

  return (
    <g opacity={0.8}>
      {/* Speed arc labels */}
      <text x={38} y={148} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">0</text>
      <text x={100} y={30} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">{Math.round(maxSpeed / 2)}</text>
      <text x={162} y={148} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">{Math.round(maxSpeed)}</text>

      {/* Speed value */}
      <text x={100} y={100} textAnchor="middle" fontSize="16" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="bold">
        {Math.round(speed)}
      </text>
      <text x={100} y={114} textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
        km/h
      </text>

      {/* Speed limit badge */}
      {limitKmh && (
        <>
          <circle cx={140} cy={130} r={10} fill="none" stroke="#ef4444" strokeWidth={1.5} />
          <text x={140} y={134} textAnchor="middle" fontSize="7" fill="#ef4444" fontFamily="var(--font-mono)">
            {limitKmh}
          </text>
        </>
      )}
    </g>
  )
}
