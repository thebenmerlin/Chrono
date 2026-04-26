'use client'

import { useMode, type Mode } from '@/context/ModeContext'

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: 'compass',     icon: '🧭', label: 'Compass' },
  { id: 'navigate',    icon: '🗺️', label: 'Navigate' },
  { id: 'temperature', icon: '🌡️', label: 'Temp' },
  { id: 'aqi',         icon: '💨', label: 'Air' },
  { id: 'speed',       icon: '⚡', label: 'Speed' },
  { id: 'worldclock',  icon: '🌍', label: 'World' },
  { id: 'planet',      icon: '🪐', label: 'Planet' },
  { id: 'clock',       icon: '🕐', label: 'Clock' },
]

export default function ModeQuickBar() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex gap-3 justify-center flex-wrap mt-4 px-4">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => {
            if (m.id === 'planet') return setMode('planet', { planet: 'mars' })
            if (m.id === 'worldclock') return setMode('worldclock', { timezone: 'UTC' })
            setMode(m.id, {})
          }}
          aria-label={m.label}
          className="flex flex-col items-center gap-0.5 opacity-60 hover:opacity-100 active:opacity-100 transition-opacity"
          style={{ color: mode === m.id ? 'var(--accent)' : 'var(--text-secondary)' }}
        >
          <span className="text-base">{m.icon}</span>
          <span className="text-[8px] tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>{m.label.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
