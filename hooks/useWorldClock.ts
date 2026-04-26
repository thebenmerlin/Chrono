'use client'

import { useState, useEffect } from 'react'

export interface WorldClockData {
  hour: number
  minute: number
  second: number
  cityLabel: string
  utcOffset: string
}

function computeForTimezone(timezone: string): WorldClockData | null {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }).formatToParts(now)

    const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value ?? '0', 10)
    const h = get('hour') % 12
    const m = get('minute')
    const s = get('second')
    const ms = now.getMilliseconds()

    const hourDeg   = h * 30 + m * 0.5 + (s / 60) * 0.5
    const minuteDeg = m * 6 + (s + ms / 1000) * 0.1
    const secondDeg = (s + ms / 1000) * 6

    const offset = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(now)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''

    const city = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone

    return { hour: hourDeg, minute: minuteDeg, second: secondDeg, cityLabel: city, utcOffset: offset }
  } catch {
    return null
  }
}

export function useWorldClock(timezone: string | undefined): WorldClockData | null {
  const [data, setData] = useState<WorldClockData | null>(() =>
    timezone ? computeForTimezone(timezone) : null
  )

  useEffect(() => {
    if (!timezone) { setData(null); return }
    setData(computeForTimezone(timezone))
    const id = setInterval(() => setData(computeForTimezone(timezone)), 50)
    return () => clearInterval(id)
  }, [timezone])

  return data
}
