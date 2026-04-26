'use client'

import { useState, useEffect } from 'react'
import { useMode } from '@/context/ModeContext'

export interface HandDegrees {
  hour: number
  minute: number
  second: number
}

export function useTime(): HandDegrees {
  const { mode } = useMode()
  const [degrees, setDegrees] = useState<HandDegrees>({ hour: 0, minute: 0, second: 0 })

  useEffect(() => {
    function tick() {
      const now = new Date()
      const h = now.getHours() % 12
      const m = now.getMinutes()
      const s = now.getSeconds()
      const ms = now.getMilliseconds()

      const secondDeg = (s + ms / 1000) * 6                     // 6° per second, smooth
      const minuteDeg = m * 6 + (s + ms / 1000) * 0.1           // 0.1° per second
      const hourDeg = h * 30 + m * 0.5 + (s / 60) * 0.5        // 0.5° per minute

      setDegrees({ hour: hourDeg, minute: minuteDeg, second: secondDeg })
    }

    tick()
    const id = setInterval(tick, 50) // ~20fps is smooth enough for a watch
    return () => clearInterval(id)
  }, [])

  // In anticlockwise mode negate all degrees
  if (mode === 'anticlockwise') {
    return {
      hour: -degrees.hour,
      minute: -degrees.minute,
      second: -degrees.second,
    }
  }

  return degrees
}
