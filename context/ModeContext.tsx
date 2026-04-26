'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type Mode =
  | 'clock'
  | 'compass'
  | 'navigate'
  | 'temperature'
  | 'aqi'
  | 'worldclock'
  | 'speed'
  | 'planet'
  | 'anticlockwise'
  | 'freeze'

export interface ModeParams {
  timezone?: string
  planet?: string
  direction?: 'north' | 'south' | 'east' | 'west'
  query?: string
}

interface ModeContextValue {
  mode: Mode
  params: ModeParams
  setMode: (mode: Mode, params?: ModeParams) => void
  previousMode: Mode
}

const ModeContext = createContext<ModeContextValue>({
  mode: 'clock',
  params: {},
  setMode: () => {},
  previousMode: 'clock',
})

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('clock')
  const [params, setParams] = useState<ModeParams>({})
  const [previousMode, setPreviousMode] = useState<Mode>('clock')

  const setMode = useCallback((newMode: Mode, newParams: ModeParams = {}) => {
    setPreviousMode((prev) => prev)
    setModeState((prev) => {
      setPreviousMode(prev)
      return newMode
    })
    setParams(newParams)
  }, [])

  return (
    <ModeContext.Provider value={{ mode, params, setMode, previousMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  return useContext(ModeContext)
}
