'use client'

interface AQIOverlayProps {
  aqi?: number | null        // 0–500 EPA scale
  label?: string | null
}

// Map AQI 0–500 to stroke color
function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#00e400'
  if (aqi <= 100) return '#ffff00'
  if (aqi <= 150) return '#ff7e00'
  if (aqi <= 200) return '#ff0000'
  if (aqi <= 300) return '#99004c'
  return '#7e0023'
}

// AQI 0–500 → arc degrees (0–270°)
function aqiToDeg(aqi: number): number {
  return Math.min((aqi / 500) * 270, 270)
}

// SVG arc path helper
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}

export default function AQIOverlay({ aqi, label }: AQIOverlayProps) {
  const safeAqi = aqi ?? 0
  const arcEnd = 135 + aqiToDeg(safeAqi)   // starts at 135° (7-o'clock), sweeps to 135+270=405=45°

  return (
    <g opacity={0.8}>
      {/* Background track */}
      <path
        d={arcPath(100, 100, 72, 135, 405)}
        fill="none"
        stroke="var(--bezel-border)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* Value arc */}
      {safeAqi > 0 && (
        <path
          d={arcPath(100, 100, 72, 135, arcEnd)}
          fill="none"
          stroke={aqiColor(safeAqi)}
          strokeWidth={5}
          strokeLinecap="round"
        />
      )}
      {/* Center readout */}
      <text x={100} y={98} textAnchor="middle" fontSize="14" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontWeight="bold">
        {safeAqi > 0 ? safeAqi : '—'}
      </text>
      {label && (
        <text x={100} y={112} textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontFamily="var(--font-mono)">
          {label}
        </text>
      )}
    </g>
  )
}
