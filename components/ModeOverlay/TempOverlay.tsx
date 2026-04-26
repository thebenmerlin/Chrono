'use client'

interface TempOverlayProps {
  outdoorC?: number | null
  bodyC?: number | null
}

export default function TempOverlay({ outdoorC, bodyC }: TempOverlayProps) {
  return (
    <g opacity={0.7}>
      {/* Scale arc -20 to +50°C mapped to 150°–30° on the left side */}
      <text x={30} y={60} textAnchor="middle" fontSize="5" fill="var(--accent)" fontFamily="var(--font-mono)">50°</text>
      <text x={25} y={103} textAnchor="middle" fontSize="5" fill="var(--text-secondary)" fontFamily="var(--font-mono)">20°</text>
      <text x={30} y={148} textAnchor="middle" fontSize="5" fill="var(--accent)" fontFamily="var(--font-mono)">-20°</text>

      {outdoorC !== null && outdoorC !== undefined && (
        <text x={100} y={130} textAnchor="middle" fontSize="9" fill="var(--text-primary)" fontFamily="var(--font-mono)">
          {Math.round(outdoorC)}°C
        </text>
      )}
      {bodyC !== null && bodyC !== undefined && (
        <text x={100} y={142} textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          ~{Math.round(bodyC)}° body
        </text>
      )}
    </g>
  )
}
