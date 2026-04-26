'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { ModeProvider, useMode } from '@/context/ModeContext'
import { useVoice } from '@/hooks/useVoice'
import { useAlert } from '@/hooks/useAlert'
import { useTime } from '@/hooks/useTime'
import { useCompass, requestCompassPermission } from '@/hooks/useCompass'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useWeather } from '@/hooks/useWeather'
import { useAQI } from '@/hooks/useAQI'
import { useSpeedLimit } from '@/hooks/useSpeedLimit'
import { useSound } from '@/hooks/useSound'
import { isMuteCommand, type ParsedCommand } from '@/lib/voiceCommands'
import { getSpeedAlertLevel } from '@/lib/speedAlert'
import WatchFace from './WatchFace'
import StatusLine from './StatusLine'
import ThemeToggle from './ThemeToggle'
import VoiceTrigger from './VoiceTrigger'
import ModeQuickBar from './ModeQuickBar'
import WorldClockPicker from './WorldClockPicker'

const GPS_MODES = new Set(['compass', 'navigate', 'temperature', 'aqi', 'speed'])

function headingToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

function WatchApp() {
  const { theme, nextTheme, cycleTheme } = useTheme()
  const { mode, params, setMode } = useMode()
  const { alert, trigger: triggerAlert, dismiss: dismissAlert } = useAlert()
  const clockDeg = useTime()
  const compass = useCompass()
  const { click: playClick } = useSound()

  const [frozenDegrees, setFrozenDegrees] = useState<{ hour: number; minute: number; second: number } | undefined>()

  // GPS — only active when in a sensor mode
  const gpsActive = GPS_MODES.has(mode)
  const geo = useGeolocation(gpsActive)

  // Weather — only when in temperature mode and we have coords
  const weatherData = useWeather(geo.lat, geo.lon, mode === 'temperature')

  // AQI — only when in aqi mode and we have coords
  const aqiData = useAQI(geo.lat, geo.lon, mode === 'aqi')

  // iOS compass permission — request when switching into compass mode
  useEffect(() => {
    if ((mode === 'compass' || mode === 'navigate') && compass.permissionState === 'prompt') {
      requestCompassPermission()
    }
  }, [mode, compass.permissionState])

  // Mechanical click on every mode switch (skip initial mount)
  const hasMounted = useRef(false)
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return }
    playClick()
  }, [mode])

  // Speed limit — only when in speed mode and we have coords
  const speedLimitData = useSpeedLimit(geo.lat, geo.lon, mode === 'speed')
  const limitKmh = speedLimitData?.limit_kmh ?? null
  const currentSpeedKmh = geo.speed !== null ? geo.speed * 3.6 : null

  // AQI alert — amber pulse when air quality is unhealthy
  useEffect(() => {
    if (aqiData && aqiData.aqi > 150 && !alert.active) {
      triggerAlert('aqi', `AQI ${aqiData.aqi} — ${aqiData.label}`)
    }
  }, [aqiData?.aqi])

  // Overspeed alert — red bleed + vibrate when 10%+ over limit
  useEffect(() => {
    if (mode !== 'speed' || currentSpeedKmh === null) return
    const level = getSpeedAlertLevel(currentSpeedKmh, limitKmh)
    if (level === 'danger' && !alert.active) {
      triggerAlert('overspeed', limitKmh ? `${Math.round(currentSpeedKmh)} / ${limitKmh} km/h` : '')
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
    }
  }, [mode, currentSpeedKmh, limitKmh])

  const handleCommand = useCallback((cmd: ParsedCommand) => {
    if (isMuteCommand(cmd.raw)) return
    if (cmd.mode === 'freeze') {
      setFrozenDegrees({ ...clockDeg })
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

  function statusText(): string {
    switch (mode) {
      case 'compass': {
        if (compass.bearing !== null) {
          const cardinal = headingToCardinal(compass.bearing)
          return `Facing: ${String(Math.round(compass.bearing)).padStart(3, '0')}° ${cardinal}`
        }
        return compass.permissionState === 'denied' ? 'Compass permission denied' : 'Compass active'
      }
      case 'navigate': {
        if (geo.error) return 'GPS unavailable'
        const heading = geo.heading ?? compass.bearing
        return heading !== null
          ? `Heading: ${headingToCardinal(heading)} · ${String(Math.round(heading)).padStart(3, '0')}°`
          : 'Navigation active'
      }
      case 'temperature': {
        if (weatherData) {
          return `${Math.round(weatherData.temp_c)}°C · feels ${Math.round(weatherData.feels_like)}°C`
        }
        return geo.error ? 'Location unavailable' : 'Fetching temperature…'
      }
      case 'aqi': {
        if (aqiData) return `AQI ${aqiData.aqi} — ${aqiData.label}`
        return geo.error ? 'Location unavailable' : 'Checking air quality…'
      }
      case 'speed': {
        if (currentSpeedKmh !== null) {
          const limitStr = limitKmh ? ` / ${limitKmh} limit` : ''
          return `${Math.round(currentSpeedKmh)} km/h${limitStr}`
        }
        return geo.error ? 'GPS unavailable' : 'Speed active'
      }
      case 'worldclock':
        return params.timezone
          ? `Showing ${params.timezone.split('/').pop()?.replace(/_/g, ' ')}`
          : 'World clock'
      case 'planet':
        return params.planet
          ? `${params.planet.charAt(0).toUpperCase() + params.planet.slice(1)} time`
          : 'Planetary time'
      case 'anticlockwise': return 'Reverse time'
      case 'freeze':        return 'Time frozen'
      case 'clock':
      default:
        return !voice.isMuted ? 'Listening…' : ''
    }
  }

  return (
    <main
      className="relative flex items-center justify-center min-h-dvh select-none"
      style={{ background: 'var(--face-bg)', transition: 'background 0.4s' }}
    >
      <div className="relative w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-dvh px-2">
        <ThemeToggle
          currentTheme={theme}
          nextTheme={nextTheme}
          onCycle={() => { cycleTheme(); playClick() }}
        />

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
            compassBearing={compass.bearing}
            geoHeading={geo.heading}
            outdoorC={weatherData?.temp_c ?? null}
            aqi={aqiData?.aqi ?? null}
            aqiLabel={aqiData?.label ?? null}
            speedKmh={currentSpeedKmh}
            limitKmh={limitKmh}
            frozenDegrees={frozenDegrees}
            onTap={() => {
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
        {mode === 'worldclock' && <WorldClockPicker />}
        <ModeQuickBar />
      </div>
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
