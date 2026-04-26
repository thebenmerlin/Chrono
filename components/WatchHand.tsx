'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, animate } from 'framer-motion'

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
  const r = 90 * length
  const tail = 90 * 0.15

  const stiffness = transition?.stiffness ?? 80
  const damping   = transition?.damping   ?? 18
  const mass      = transition?.mass      ?? 1.2

  // Bypass Framer Motion's CSS transform system entirely.
  // useMotionValue + animate() drives the value; onUpdate writes it
  // directly as a native SVG `transform` attribute which every browser
  // supports unconditionally.
  const rotation = useMotionValue(degrees)
  const gRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const controls = animate(rotation, degrees, {
      type: 'spring',
      stiffness,
      damping,
      mass,
      onUpdate: (val) => {
        gRef.current?.setAttribute('transform', `rotate(${val}, 100, 100)`)
      },
    })
    return () => controls.stop()
  }, [rotation, degrees, stiffness, damping, mass])

  return (
    <g ref={gRef} className={className}>
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
