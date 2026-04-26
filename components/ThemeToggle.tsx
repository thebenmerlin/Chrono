'use client'

import { motion, AnimatePresence } from 'framer-motion'

const THEME_ACCENTS: Record<string, string> = {
  arctic: '#d0d0d0',
  void: '#ffffff',
  brass: '#c8a430',
  abyss: '#00d4ff',
}

interface ThemeToggleProps {
  currentTheme: string
  nextTheme: string
  onCycle: () => void
}

export default function ThemeToggle({ currentTheme, nextTheme, onCycle }: ThemeToggleProps) {
  const dotColor = THEME_ACCENTS[nextTheme] ?? '#888'

  return (
    <button
      onClick={onCycle}
      aria-label={`Switch to ${nextTheme} theme`}
      className="absolute top-3 right-3 w-7 h-7 rounded-full border border-[var(--bezel-border)] flex items-center justify-center bg-[var(--bezel-bg)] transition-colors duration-300"
      style={{ zIndex: 30 }}
    >
      <motion.div
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: dotColor }}
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.15 }}
      />
    </button>
  )
}
