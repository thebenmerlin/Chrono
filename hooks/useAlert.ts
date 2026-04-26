'use client'

import { useState, useEffect } from 'react'

export interface AlertState {
  type: 'overspeed' | 'aqi' | 'bodytemp' | 'arrival' | null
  active: boolean
  message: string
}

export function useAlert() {
  const [alert, setAlert] = useState<AlertState>({ type: null, active: false, message: '' })

  const trigger = (type: AlertState['type'], message = '') => {
    setAlert({ type, active: true, message })
  }

  const dismiss = () => {
    setAlert({ type: null, active: false, message: '' })
  }

  // Auto-dismiss arrival alert after 2s
  useEffect(() => {
    if (alert.type === 'arrival' && alert.active) {
      const id = setTimeout(dismiss, 2000)
      return () => clearTimeout(id)
    }
  }, [alert.type, alert.active])

  return { alert, trigger, dismiss }
}
