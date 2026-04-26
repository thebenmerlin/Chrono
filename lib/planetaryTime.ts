export interface PlanetaryTimeResult {
  hourDeg: number      // 0–360, for hour hand
  minuteDeg: number    // 0–360, for minute hand
  secondDeg: number    // 0–360, for second hand (speed reflects planetary day length)
  label: string        // e.g. "14:22"
  planet: string
  dayLengthHours: number
  timeFactor: number   // how fast local time flows vs Earth (>1 = faster, <1 = slower)
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
  // Time factor: how fast local time flows vs Earth (>1 = faster, <1 = slower)
  const timeFactor = 24 / dayHours
  // Second hand: non-modulo accumulated rotation so CSS always animates forward (no backward wrap)
  // At timeFactor=2.42 (Jupiter), the hand completes one revolution every ~24.8 real seconds
  // At timeFactor=0.017 (Mercury), the hand barely moves — one revolution every ~58 real minutes
  const secondDeg = (nowMs / 1000) * timeFactor * 6

  const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

  return { hourDeg, minuteDeg, secondDeg, label, planet: name, dayLengthHours: dayHours, timeFactor }
}
