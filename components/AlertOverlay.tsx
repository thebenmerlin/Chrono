'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/hooks/useAlert'

interface AlertOverlayProps {
  alert: ReturnType<typeof useAlert>['alert']
}

const ALERT_COLORS: Record<string, string> = {
  overspeed: 'rgba(239,68,68,0.25)',
  aqi: 'rgba(251,146,60,0.2)',
  bodytemp: 'rgba(251,191,36,0.15)',
  arrival: 'rgba(34,197,94,0.25)',
}

export default function AlertOverlay({ alert }: AlertOverlayProps) {
  return (
    <AnimatePresence>
      {alert.active && alert.type && (
        <motion.rect
          x={0}
          y={0}
          width={200}
          height={200}
          rx={100}
          ry={100}
          fill={ALERT_COLORS[alert.type] ?? 'rgba(239,68,68,0.2)'}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0.6, 1] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: alert.type === 'arrival' ? 0.5 : 2,
            repeat: alert.type === 'arrival' ? 0 : Infinity,
            ease: 'easeInOut',
          }}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </AnimatePresence>
  )
}
