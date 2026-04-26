'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatusLineProps {
  text: string
}

export default function StatusLine({ text }: StatusLineProps) {
  const [displayed, setDisplayed] = useState('')
  const [key, setKey] = useState(0)

  // Typewriter effect — re-runs when text changes
  useEffect(() => {
    setDisplayed('')
    setKey((k) => k + 1)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [text])

  if (!text) return null

  return (
    <motion.p
      key={key}
      className="text-center text-xs tracking-widest mt-4 px-4 h-5"
      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayed}
    </motion.p>
  )
}
