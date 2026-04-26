'use client'

import { useCallback, useRef } from 'react'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ModeProvider, useMode } from '@/context/ModeContext'
import { useVoice } from '@/hooks/useVoice'
import { useAlert } from '@/hooks/useAlert'
import { useTime } from '@/hooks/useTime'
import { isMuteCommand, type ParsedCommand } from '@/lib/voiceCommands'
import WatchFace from './WatchFace'
import StatusLine from './StatusLine'
import ThemeToggle from './ThemeToggle'
import VoiceTrigger from './VoiceTrigger'
import ModeQuickBar from './ModeQuickBar'

function WatchApp() {
  const { theme, nextTheme, cycleTheme } = useTheme()
  const { mode, params, setMode } = useMode()
  const { alert, trigger: triggerAlert, dismiss: dismissAlert } = useAlert()
  const clockDeg = useTime()
  const frozenRef = useRef({ hour: 0, minute: 0, second: 0 })

  const handleCommand = useCallback((cmd: ParsedCommand) => {
    if (isMuteCommand(cmd.raw)) return // handled by useVoice consumer
    if (cmd.mode === 'freeze') {
      frozenRef.current = { ...clockDeg }
    }
    setMode(cmd.mode, cmd.params)
  }, [clockDeg, setMode])

  const voice = useVoice((cmd) => {
    if (isMuteCommand(cmd.raw)) {
      voice.mute()
      return
    }
    handleCommand(cmd)
  })

  // Status line text per mode
  function statusText(): string {
    switch (mode) {
      case 'compass':   return params.direction ? `Pointing ${params.direction.toUpperCase()}` : 'Compass active'
      case 'navigate':  return params.query ? `Navigating to ${params.query}` : 'Navigation active'
      case 'temperature': return 'Fetching temperature…'
      case 'aqi':       return 'Checking air quality…'
      case 'speed':     return 'Speed active'
      case 'worldclock': return params.timezone ? `Showing ${params.timezone.split('/').pop()?.replace(/_/g, ' ')}` : 'World clock'
      case 'planet':    return params.planet ? `${params.planet.charAt(0).toUpperCase() + params.planet.slice(1)} time` : 'Planetary time'
      case 'anticlockwise': return 'Reverse time'
      case 'freeze':    return 'Time frozen'
      case 'clock':
      default:
        if (!voice.isMuted) return 'Listening…'
        return ''
    }
  }

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-dvh select-none"
      style={{ background: 'var(--face-bg)', transition: 'background 0.4s' }}
    >
      <ThemeToggle currentTheme={theme} nextTheme={nextTheme} onCycle={cycleTheme} />

      {/* Voice trigger at crown position (above the watch circle) */}
      <div className="relative">
        <VoiceTrigger
          isMuted={voice.isMuted}
          isHearing={voice.isHearing}
          isRecognising={voice.isRecognising}
          supported={voice.supported}
          onToggle={voice.toggleMute}
        />

        <WatchFace
          isMuted={voice.isMuted}
          isHearing={voice.isHearing}
          isRecognising={voice.isRecognising}
          alert={alert}
          onTap={() => {
            // Single tap cycles modes if voice unavailable
            if (!voice.supported) {
              const cycle: Parameters<typeof setMode>[0][] = [
                'clock', 'compass', 'temperature', 'aqi', 'speed', 'worldclock', 'planet', 'anticlockwise',
              ]
              const idx = cycle.indexOf(mode as Parameters<typeof setMode>[0])
              setMode(cycle[(idx + 1) % cycle.length], {})
            }
          }}
        />
      </div>

      <StatusLine text={statusText()} />
      <ModeQuickBar />
    </main>
  )
}

export default function WatchShell() {
  return (
    <ThemeProvider>
      <ModeProvider>
        <WatchApp />
      </ModeProvider>
    </ThemeProvider>
  )
}
