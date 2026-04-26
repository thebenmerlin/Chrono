'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface CenterLabelProps {
  mode: string
  isListening: boolean
}

const MODE_LABELS: Record<string, string> = {
  clock: '',
  compass: 'COMPASS',
  navigate: 'NAVIGATE',
  temperature: 'TEMP',
  aqi: 'AIR',
  worldclock: 'WORLD',
  speed: 'SPEED',
  planet: 'PLANET',
  anticlockwise: 'REVERSE',
  freeze: 'FROZEN',
}

export default function CenterLabel({ mode, isListening }: CenterLabelProps) {
  const label = MODE_LABELS[mode] ?? mode.toUpperCase()

  return (
    <AnimatePresence mode="wait">
      {isListening ? (
        <motion.text
          key="listening"
          x={100}
          y={74}
          textAnchor="middle"
          fontSize="7"
          fill="var(--accent)"
          fontFamily="var(--font-mono)"
          letterSpacing="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          · · ·
        </motion.text>
      ) : label ? (
        <motion.text
          key={mode}
          x={100}
          y={74}
          textAnchor="middle"
          fontSize="6"
          fill="var(--text-secondary)"
          fontFamily="var(--font-mono)"
          letterSpacing="2"
          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
          initial={{ opacity: 0, scale: 1.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {label}
        </motion.text>
      ) : null}
    </AnimatePresence>
  )
}
