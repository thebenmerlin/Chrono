'use client'

// Zero animation libraries. Rotation is a plain CSS `transform` style on a `<g>`.
// CSS `transform: rotate()` on SVG elements is universally supported in modern browsers
// (unlike Framer Motion 11's individual `rotate:` CSS property which SVG ignores).
// transform-box: view-box + transform-origin: center → pivot at SVG (100,100).

interface WatchHandProps {
  degrees: number
  length: number        // 0–1, fraction of face radius
  width: number
  color?: string
  className?: string
  hasLumeDot?: boolean
  shadow?: boolean
  transition?: { type: string; stiffness: number; damping: number; mass: number }
}

export default function WatchHand({
  degrees,
  length,
  width,
  color = 'var(--hand-color)',
  className = '',
  hasLumeDot = false,
  shadow = true,
}: WatchHandProps) {
  const cx = 100
  const cy = 100
  const r    = 90 * length
  const tail = 90 * 0.15

  return (
    <g
      className={className}
      style={{
        transform: `rotate(${degrees}deg)`,
        transformBox: 'view-box' as const,
        transformOrigin: 'center',
        transition: 'transform 200ms ease-out',
      }}
    >
      {shadow && (
        <line
          x1={cx + 1}
          y1={cy + tail + 1}
          x2={cx + 1}
          y2={cy - r + 1}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth={width + 1}
          strokeLinecap="round"
        />
      )}
      <line
        x1={cx}
        y1={cy + tail}
        x2={cx}
        y2={cy - r}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Outline / border */}
      <line
        x1={cx}
        y1={cy + tail}
        x2={cx}
        y2={cy - r}
        stroke="var(--hand-outline)"
        strokeWidth={width + 0.5}
        strokeLinecap="round"
        opacity={0.4}
        style={{ mixBlendMode: 'multiply' }}
      />
      {hasLumeDot && (
        <circle
          cx={cx}
          cy={cy - r + 6}
          r={width * 0.7}
          fill="var(--accent)"
          opacity={0.9}
        />
      )}
    </g>
  )
}
