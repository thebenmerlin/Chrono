'use client'

import { useState, useEffect, useRef } from 'react'

export interface WeatherData {
  temp_c: number
  temp_f: number
  feels_like: number
  condition: string
}

export function useWeather(lat: number | null, lon: number | null, active = false): WeatherData | null {
  const [data, setData] = useState<WeatherData | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active || lat === null || lon === null) return

    async function fetch_() {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`)
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch {
        // network error — keep last value
      }
    }

    fetch_()
    timerRef.current = setInterval(fetch_, 5 * 60 * 1000) // every 5 min

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active, lat, lon])

  // Clear stale data when deactivated
  useEffect(() => {
    if (!active) setData(null)
  }, [active])

  return data
}
