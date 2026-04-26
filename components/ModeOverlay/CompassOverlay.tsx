'use client'

// Cardinal directions drawn at N/E/S/W inside the dial
export default function CompassOverlay() {
  const labels = [
    { label: 'N', x: 100, y: 22 },
    { label: 'S', x: 100, y: 182 },
    { label: 'E', x: 178, y: 103 },
    { label: 'W', x: 22, y: 103 },
  ]

  return (
    <g opacity={0.6}>
      {labels.map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
          fill="var(--accent)"
          fontFamily="var(--font-mono)"
          letterSpacing="1"
        >
          {label}
        </text>
      ))}
      {/* Subtle cross-hair */}
      <line x1={100} y1={30} x2={100} y2={170} stroke="var(--accent)" strokeWidth={0.3} opacity={0.3} />
      <line x1={30} y1={100} x2={170} y2={100} stroke="var(--accent)" strokeWidth={0.3} opacity={0.3} />
    </g>
  )
}
