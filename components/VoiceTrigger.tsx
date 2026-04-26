'use client'

import { motion } from 'framer-motion'

interface VoiceTriggerProps {
  isMuted: boolean
  isHearing: boolean
  isRecognising: boolean
  supported: boolean
  onToggle: () => void
}

export default function VoiceTrigger({ isMuted, isHearing, isRecognising, supported, onToggle }: VoiceTriggerProps) {
  const label = isMuted ? 'Tap to listen' : isRecognising ? 'Hearing...' : 'Listening'

  return (
    <div className="absolute" style={{ top: 'calc(50% - 45vw)', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
      <motion.button
        onClick={onToggle}
        aria-label={label}
        className="relative flex items-center justify-center w-8 h-8 rounded-full"
        style={{
          background: 'var(--bezel-bg)',
          border: '1px solid var(--bezel-border)',
        }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Mic SVG */}
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          animate={
            !isMuted
              ? { scale: [1, 1.08, 1], opacity: [1, 0.8, 1] }
              : { scale: 1, opacity: 0.35 }
          }
          transition={{ duration: isRecognising ? 0.4 : 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x={9} y={2} width={6} height={11} rx={3} fill="var(--accent)" />
          <path
            d="M5 10a7 7 0 0 0 14 0"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <line x1={12} y1={17} x2={12} y2={21} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
          <line x1={9} y1={21} x2={15} y2={21} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />

          {/* Strike-through line when muted */}
          {isMuted && (
            <line x1={3} y1={3} x2={21} y2={21} stroke="var(--text-secondary)" strokeWidth={2} strokeLinecap="round" />
          )}
        </motion.svg>

        {/* Live pulse ring when unmuted */}
        {!isMuted && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: '1.5px solid var(--accent)' }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.button>

      {!supported && (
        <p className="text-[9px] text-center mt-1" style={{ color: 'var(--text-secondary)' }}>tap only</p>
      )}
    </div>
  )
}
