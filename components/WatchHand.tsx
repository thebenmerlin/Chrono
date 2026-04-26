'use client'

import { motion } from 'framer-motion'

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
  transition,
}: WatchHandProps) {
  // SVG viewBox is 200x200, center is 100,100
  // Hand is drawn pointing UP (to 12), rotated by degrees
  const cx = 100
  const cy = 100
  const r = 90 * length    // tip distance from center
  const tail = 90 * 0.15  // tail length behind center

  const springTransition = transition ?? {
    type: 'spring',
    stiffness: 80,
    damping: 18,
    mass: 1.2,
  }

  return (
    <motion.g
      className={className}
      animate={{ rotate: degrees }}
      transition={springTransition}
      style={{ transformBox: 'view-box' as const }}
      transformTemplate={(props) => {
        // CSS individual `rotate` property has patchy SVG support in some browsers.
        // Force a classic `transform:` string instead, rotating around the SVG center
        // (100, 100) using the translate–rotate–translate trick.
        // With transformBox:view-box, 50% = 100 SVG user units = watch center.
        const deg =
          typeof props.rotate === 'number'
            ? props.rotate
            : parseFloat(String(props.rotate)) || 0
        return `translate(50%, 50%) rotate(${deg}deg) translate(-50%, -50%)`
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
    </motion.g>
  )
}
