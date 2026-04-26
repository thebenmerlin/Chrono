'use client'

import { useMemo } from 'react'

export interface WorldClockData {
  hour: number
  minute: number
  second: number
  cityLabel: string
  utcOffset: string
}

export function useWorldClock(timezone: string | undefined): WorldClockData | null {
  return useMemo(() => {
    if (!timezone) return null

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

      const hourDeg = h * 30 + m * 0.5
      const minuteDeg = m * 6 + s * 0.1
      const secondDeg = s * 6

      // Format UTC offset label
      const offset = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value ?? ''

      const city = timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone

      return {
        hour: hourDeg,
        minute: minuteDeg,
        second: secondDeg,
        cityLabel: city,
        utcOffset: offset,
      }
    } catch {
      return null
    }
  }, [timezone])
}
