'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMode } from '@/context/ModeContext'

interface CenterPinProps {
  isMuted: boolean
  isHearing: boolean
  alertActive: boolean
}

export default function CenterPin({ isMuted, isHearing, alertActive }: CenterPinProps) {
  const { mode } = useMode()

  const pinColor = alertActive
    ? '#ef4444'
    : mode === 'planet'
    ? 'var(--accent)'
    : 'var(--center-pin)'

  return (
    <motion.circle
      cx={100}
      cy={100}
      r={3.5}
      fill={pinColor}
      animate={
        alertActive
          ? { scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }
          : !isMuted && isHearing
          ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
          : !isMuted
          ? { scale: [1, 1.08, 1], opacity: [1, 0.9, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{
        duration: alertActive ? 1 : 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
