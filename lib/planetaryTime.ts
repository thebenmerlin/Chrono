export interface PlanetaryTimeResult {
  hourDeg: number      // 0–360, for hour hand
  minuteDeg: number    // 0–360, for minute hand
  label: string        // e.g. "14:22"
  planet: string
  dayLengthHours: number
}

// Solar day lengths in Earth hours
const PLANET_DAYS: Record<string, number> = {
  mercury: 4222.6,
  venus: 2802.0,
  mars: 24.6229444,
  jupiter: 9.9259,
  saturn: 10.6562,
  uranus: 17.2333,
  neptune: 16.1100,
}

// J2000 epoch: Jan 1 2000 12:00 UTC in ms
const J2000_MS = 946728000000

export function getPlanetaryTime(planet: string): PlanetaryTimeResult {
  const name = planet.toLowerCase()
  const dayHours = PLANET_DAYS[name] ?? PLANET_DAYS.mars

  const nowMs = Date.now()
  const elapsedMs = nowMs - J2000_MS

  // Full planet-days elapsed since J2000
  const dayMs = dayHours * 3600 * 1000
  const fractionOfDay = ((elapsedMs % dayMs) + dayMs) % dayMs / dayMs

  // Express as 12-hour clock
  const totalMinutes = fractionOfDay * 12 * 60
  const h = Math.floor(totalMinutes / 60) % 12
  const m = Math.floor(totalMinutes % 60)
  const s = Math.floor((totalMinutes * 60) % 60)

  const hourDeg = h * 30 + m * 0.5
  const minuteDeg = m * 6 + s * 0.1

  const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

  return { hourDeg, minuteDeg, label, planet: name, dayLengthHours: dayHours }
}
