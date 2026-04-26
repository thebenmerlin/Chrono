import type { Mode, ModeParams } from '@/context/ModeContext'

export interface ParsedCommand {
  mode: Mode
  params: ModeParams
  raw: string
}

// City/country → IANA timezone map (commonly spoken names)
const TIMEZONE_MAP: Record<string, string> = {
  // Countries
  'japan': 'Asia/Tokyo',
  'india': 'Asia/Kolkata',
  'china': 'Asia/Shanghai',
  'australia': 'Australia/Sydney',
  'usa': 'America/New_York',
  'uk': 'Europe/London',
  'england': 'Europe/London',
  'france': 'Europe/Paris',
  'germany': 'Europe/Berlin',
  'italy': 'Europe/Rome',
  'spain': 'Europe/Madrid',
  'russia': 'Europe/Moscow',
  'brazil': 'America/Sao_Paulo',
  'argentina': 'America/Argentina/Buenos_Aires',
  'mexico': 'America/Mexico_City',
  'canada': 'America/Toronto',
  'korea': 'Asia/Seoul',
  'uae': 'Asia/Dubai',
  'singapore-country': 'Asia/Singapore',
  'indonesia': 'Asia/Jakarta',
  'egypt': 'Africa/Cairo',
  'south africa': 'Africa/Johannesburg',
  'nigeria': 'Africa/Lagos',
  'kenya': 'Africa/Nairobi',
  'turkey': 'Europe/Istanbul',
  'greece': 'Europe/Athens',
  'sweden': 'Europe/Stockholm',
  'norway': 'Europe/Oslo',
  'netherlands': 'Europe/Amsterdam',
  'switzerland': 'Europe/Zurich',
  'portugal': 'Europe/Lisbon',
  'poland': 'Europe/Warsaw',
  'ukraine': 'Europe/Kiev',
  'israel': 'Asia/Jerusalem',
  'saudi arabia': 'Asia/Riyadh',
  'pakistan': 'Asia/Karachi',
  'bangladesh': 'Asia/Dhaka',
  'thailand': 'Asia/Bangkok',
  'vietnam': 'Asia/Ho_Chi_Minh',
  'philippines': 'Asia/Manila',
  'malaysia': 'Asia/Kuala_Lumpur',
  'new zealand': 'Pacific/Auckland',
  // Cities
  'tokyo': 'Asia/Tokyo',
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'toronto': 'America/Toronto',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'dubai': 'Asia/Dubai',
  'singapore': 'Asia/Singapore',
  'hong kong': 'Asia/Hong_Kong',
  'shanghai': 'Asia/Shanghai',
  'beijing': 'Asia/Shanghai',
  'seoul': 'Asia/Seoul',
  'moscow': 'Europe/Moscow',
  'berlin': 'Europe/Berlin',
  'madrid': 'Europe/Madrid',
  'rome': 'Europe/Rome',
  'amsterdam': 'Europe/Amsterdam',
  'zurich': 'Europe/Zurich',
  'istanbul': 'Europe/Istanbul',
  'cairo': 'Africa/Cairo',
  'mumbai': 'Asia/Kolkata',
  'delhi': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'karachi': 'Asia/Karachi',
  'dhaka': 'Asia/Dhaka',
  'jakarta': 'Asia/Jakarta',
  'bangkok': 'Asia/Bangkok',
  'kuala lumpur': 'Asia/Kuala_Lumpur',
  'manila': 'Asia/Manila',
  'ho chi minh': 'Asia/Ho_Chi_Minh',
  'riyadh': 'Asia/Riyadh',
  'tehran': 'Asia/Tehran',
  'nairobi': 'Africa/Nairobi',
  'lagos': 'Africa/Lagos',
  'johannesburg': 'Africa/Johannesburg',
  'sao paulo': 'America/Sao_Paulo',
  'buenos aires': 'America/Argentina/Buenos_Aires',
  'mexico city': 'America/Mexico_City',
  'lima': 'America/Lima',
  'bogota': 'America/Bogota',
  'santiago': 'America/Santiago',
  'lisbon': 'Europe/Lisbon',
  'oslo': 'Europe/Oslo',
  'stockholm': 'Europe/Stockholm',
  'helsinki': 'Europe/Helsinki',
  'warsaw': 'Europe/Warsaw',
  'athens': 'Europe/Athens',
  'vienna': 'Europe/Vienna',
  'brussels': 'Europe/Brussels',
  'prague': 'Europe/Prague',
  'budapest': 'Europe/Budapest',
  'bucharest': 'Europe/Bucharest',
  'reykjavik': 'Atlantic/Reykjavik',
  'hawaii': 'Pacific/Honolulu',
  'honolulu': 'Pacific/Honolulu',
  'anchorage': 'America/Anchorage',
  'alaska': 'America/Anchorage',
}

const PLANET_NAMES = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

function extractTimezone(transcript: string): string | undefined {
  const lower = transcript.toLowerCase()
  // Match "time in X", "what time in X", "time at X"
  const match = lower.match(/time\s+(?:in|at|for)\s+(.+)$/)
  const location = match?.[1]?.trim() ?? ''

  // Try exact match first
  if (TIMEZONE_MAP[location]) return TIMEZONE_MAP[location]

  // Try partial match
  for (const [key, tz] of Object.entries(TIMEZONE_MAP)) {
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

  // Mute
  if (t.includes('mute') || t.includes('stop listening') || t.includes('be quiet')) {
    return { mode: 'clock', params: {}, raw: transcript } // handled specially by consumer
  }

  // Reset / Home
  if (t.includes('reset') || t.includes('home') || t === 'stop' || t === 'clock') {
    return { mode: 'clock', params: {}, raw: transcript }
  }

  // Freeze
  if (t.includes('freeze') || t.includes('pause')) {
    return { mode: 'freeze', params: {}, raw: transcript }
  }

  // Anti-clockwise
  if (t.includes('reverse') || t.includes('anti') || t.includes('counter') || t.includes('backwards')) {
    return { mode: 'anticlockwise', params: {}, raw: transcript }
  }

  // Navigate
  if (t.includes('navigate') || t.includes('guide') || t.includes('directions')) {
    const query = t.replace(/navigate|guide me|guide|directions?|to|the/g, '').trim() || undefined
    return { mode: 'navigate', params: { query }, raw: transcript }
  }

  // Cardinal compass directions
  if (t === 'north' || t.endsWith(' north')) return { mode: 'compass', params: { direction: 'north' }, raw: transcript }
  if (t === 'south' || t.endsWith(' south')) return { mode: 'compass', params: { direction: 'south' }, raw: transcript }
  if (t === 'east'  || t.endsWith(' east'))  return { mode: 'compass', params: { direction: 'east' }, raw: transcript }
  if (t === 'west'  || t.endsWith(' west'))  return { mode: 'compass', params: { direction: 'west' }, raw: transcript }

  // Compass (general)
  if (t.includes('compass') || t.includes('direction')) {
    return { mode: 'compass', params: {}, raw: transcript }
  }

  // Temperature
  if (t.includes('temperature') || t.includes('temp') || t.includes('weather') || t.includes('hot') || t.includes('cold')) {
    return { mode: 'temperature', params: {}, raw: transcript }
  }

  // AQI / Air Quality
  if (t.includes('air') || t.includes('aqi') || t.includes('breathe') || t.includes('pollution')) {
    return { mode: 'aqi', params: {}, raw: transcript }
  }

  // World Clock
  if (t.includes('time in') || t.includes('time at') || t.includes('time for')) {
    const timezone = extractTimezone(transcript)
    return { mode: 'worldclock', params: { timezone }, raw: transcript }
  }

  // Speed
  if (t.includes('speed') || t.includes('speedometer') || t.includes('how fast')) {
    return { mode: 'speed', params: {}, raw: transcript }
  }

  // Planetary time
  if (t.includes('planet') || t.includes('mars') || t.includes('jupiter') || t.includes('saturn') ||
      t.includes('mercury') || t.includes('venus') || t.includes('uranus') || t.includes('neptune')) {
    const planet = extractPlanet(transcript) ?? 'mars'
    return { mode: 'planet', params: { planet }, raw: transcript }
  }

  return null
}

export function isMuteCommand(transcript: string): boolean {
  const t = transcript.toLowerCase().trim()
  return t.includes('mute') || t.includes('stop listening') || t.includes('be quiet')
}
