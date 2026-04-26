'use client'

import { useState, useEffect, useRef } from 'react'
import type { Mode } from '@/context/ModeContext'

export type TransitionPhase = 'idle' | 'spin-in' | 'hold' | 'swing-out'

export interface ModeTransitionState {
  phase: TransitionPhase
  /** During swing-out, the target degrees for each hand */
  targetHour: number
  targetMinute: number
}

/**
 * Drives the hero mode-switch animation:
 * 1. spin-in  (300ms) — hands rotate rapidly inward toward 12
 * 2. hold     (150ms) — brief pause at 12
 * 3. swing-out (600ms) — hands ease out to new position
 * 4. idle     — live sensor / clock values take over
 *
 * Total: ~1.05s before idle (Framer Motion spring adds the settle tail)
 */
export function useModeTransition(mode: Mode): ModeTransitionState {
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const prevMode = useRef<Mode>(mode)
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // Don't animate on first mount
    if (prevMode.current === mode) return
    prevMode.current = mode

    // Clear any in-flight timers
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []

    setPhase('spin-in')

    timerRefs.current.push(
      setTimeout(() => setPhase('hold'), 300),
      setTimeout(() => setPhase('swing-out'), 450),   // 300 + 150
      setTimeout(() => setPhase('idle'), 1050),         // 300 + 150 + 600
    )

    return () => {
      timerRefs.current.forEach(clearTimeout)
    }
  }, [mode])

  return {
    phase,
    // hands always target 0° (12 o'clock) during spin-in / hold
    targetHour: 0,
    targetMinute: 0,
  }
}
