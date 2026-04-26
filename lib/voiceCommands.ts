import type { Mode, ModeParams } from '@/context/ModeContext'
import { VOICE_TIMEZONE_MAP, COUNTRY_TIMEZONE_MAP } from '@/lib/worldClockCities'

export interface ParsedCommand {
  mode: Mode
  params: ModeParams
  raw: string
}

const PLANET_NAMES = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

function extractTimezone(transcript: string): string | undefined {
  const lower = transcript.toLowerCase()
  const match = lower.match(/time\s+(?:in|at|for)\s+(.+)$/)
  const location = match?.[1]?.trim() ?? ''

  // Exact match in city list first
  if (VOICE_TIMEZONE_MAP[location]) return VOICE_TIMEZONE_MAP[location]
  // Then country aliases
  if (COUNTRY_TIMEZONE_MAP[location]) return COUNTRY_TIMEZONE_MAP[location]

  // Partial match against city names
  for (const [key, tz] of Object.entries(VOICE_TIMEZONE_MAP)) {
    if (location.includes(key) || key.includes(location)) return tz
  }
  for (const [key, tz] of Object.entries(COUNTRY_TIMEZONE_MAP)) {
    if (location.includes(key) || key.includes(location)) return tz
  }
  return undefined
}

function extractPlanet(transcript: string): string | undefined {
  const lower = transcript.toLowerCase()
  return PLANET_NAMES.find((p) => lower.includes(p))
}

export function parseVoiceCommand(transcript: string): ParsedCommand | null {
  const t = transcript.toLowerCase().trim()
  // Strip filler words so "hey show me the compass" → "compass"
  const cleaned = t
    .replace(/\b(hey|okay|ok|show|switch|change|go|set|turn|enable|start|open|mode|to|me|the|please|now|on)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Mute
  if (t.includes('mute') || t.includes('stop listening') || t.includes('be quiet') || t.includes('silence')) {
    return { mode: 'clock', params: {}, raw: transcript }
  }

  // Reset / Clock / Home
  if (
    t.includes('reset') || t.includes('home') ||
    cleaned === 'clock' || cleaned === 'stop' || cleaned === 'normal' || cleaned === 'back'
  ) {
    return { mode: 'clock', params: {}, raw: transcript }
  }

  // Freeze / Pause
  if (t.includes('freeze') || t.includes('pause') || t.includes('stop time')) {
    return { mode: 'freeze', params: {}, raw: transcript }
  }

  // Anti-clockwise / Reverse
  if (
    t.includes('reverse') || t.includes('anti') || t.includes('counter') ||
    t.includes('backwards') || t.includes('backward') || t.includes('anticlockwise') ||
    t.includes('counterclockwise')
  ) {
    return { mode: 'anticlockwise', params: {}, raw: transcript }
  }

  // Navigate
  if (t.includes('navigate') || t.includes('navigation') || t.includes('guide') || t.includes('directions')) {
    const query = cleaned.replace(/navigate|navigation|guide|directions?/g, '').trim() || undefined
    return { mode: 'navigate', params: { query }, raw: transcript }
  }

  // Cardinal compass directions
  if (t === 'north' || cleaned === 'north' || t.endsWith(' north')) return { mode: 'compass', params: { direction: 'north' }, raw: transcript }
  if (t === 'south' || cleaned === 'south' || t.endsWith(' south')) return { mode: 'compass', params: { direction: 'south' }, raw: transcript }
  if (t === 'east'  || cleaned === 'east'  || t.endsWith(' east'))  return { mode: 'compass', params: { direction: 'east'  }, raw: transcript }
  if (t === 'west'  || cleaned === 'west'  || t.endsWith(' west'))  return { mode: 'compass', params: { direction: 'west'  }, raw: transcript }

  // Compass
  if (
    t.includes('compass') || t.includes('direction') || t.includes('heading') ||
    cleaned === 'compass' || cleaned === 'directions'
  ) {
    return { mode: 'compass', params: {}, raw: transcript }
  }

  // Speed
  if (
    t.includes('speed') || t.includes('speedometer') || t.includes('how fast') ||
    t.includes('velocity') || cleaned === 'speed'
  ) {
    return { mode: 'speed', params: {}, raw: transcript }
  }

  // AQI / Air Quality — check BEFORE temperature to avoid "air" matching weather
  if (
    t.includes('air quality') || t.includes('aqi') || t.includes('pollution') ||
    t.includes('breathe') || t.includes('breathing') || cleaned === 'air'
  ) {
    return { mode: 'aqi', params: {}, raw: transcript }
  }

  // Temperature / Weather
  if (
    t.includes('temperature') || t.includes('temp') || t.includes('weather') ||
    t.includes('hot') || t.includes('cold') || t.includes('warm') ||
    cleaned === 'temperature' || cleaned === 'weather'
  ) {
    return { mode: 'temperature', params: {}, raw: transcript }
  }

  // World Clock — "time in X" OR "world clock" as a standalone
  if (t.includes('time in') || t.includes('time at') || t.includes('time for')) {
    const timezone = extractTimezone(transcript)
    return { mode: 'worldclock', params: { timezone }, raw: transcript }
  }
  if (
    t.includes('world clock') || t.includes('world time') || t.includes('other timezone') ||
    t.includes('another timezone') || cleaned === 'world' || cleaned === 'worldclock'
  ) {
    return { mode: 'worldclock', params: { timezone: 'UTC' }, raw: transcript }
  }

  // Planetary time
  if (
    t.includes('planet') || t.includes('planetary') ||
    t.includes('mars') || t.includes('jupiter') || t.includes('saturn') ||
    t.includes('mercury') || t.includes('venus') || t.includes('uranus') || t.includes('neptune')
  ) {
    const planet = extractPlanet(transcript) ?? 'mars'
    return { mode: 'planet', params: { planet }, raw: transcript }
  }

  return null
}

export function isMuteCommand(transcript: string): boolean {
  const t = transcript.toLowerCase().trim()
  return t.includes('mute') || t.includes('stop listening') || t.includes('be quiet')
}
