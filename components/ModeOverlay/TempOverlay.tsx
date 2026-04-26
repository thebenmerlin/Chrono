'use client'

interface TempOverlayProps {
  outdoorC?: number | null
}

export default function TempOverlay({ outdoorC }: TempOverlayProps) {
  return (
    <g opacity={0.7}>
      {/* Scale labels: -20 to +50°C on the left arc */}
      <text x={30} y={60} textAnchor="middle" fontSize="5" fill="var(--accent)" fontFamily="var(--font-mono)">50°</text>
      <text x={25} y={103} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">20°</text>
      <text x={30} y={148} textAnchor="middle" fontSize="5" fill="var(--accent)" fontFamily="var(--font-mono)">-20°</text>

      {outdoorC !== null && outdoorC !== undefined && (
        <text x={100} y={133} textAnchor="middle" fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          {Math.round(outdoorC)}°C
        </text>
      )}
    </g>
  )
}
