'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type Theme = 'arctic' | 'void' | 'brass' | 'abyss'

const THEMES: Theme[] = ['arctic', 'void', 'brass', 'abyss']

interface ThemeContextValue {
  theme: Theme
  nextTheme: Theme
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'arctic',
  nextTheme: 'void',
  cycleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('arctic')

  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'arctic' ? '' : theme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length])
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, nextTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
