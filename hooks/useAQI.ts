'use client'

import { useState, useEffect, useRef } from 'react'

export interface AQIData {
  aqi: number        // EPA 0–500 approximate
  aqi_index: number  // OWM 1–5
  pm2_5: number
  pm10: number
  label: string      // Good / Fair / Moderate / Poor / Very Poor
}

export function useAQI(lat: number | null, lon: number | null, active = false): AQIData | null {
  const [data, setData] = useState<AQIData | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active || lat === null || lon === null) return

    async function fetch_() {
      try {
        const res = await fetch(`/api/aqi?lat=${lat}&lon=${lon}`)
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch {
        // network error — keep last value
      }
    }

    fetch_()
    timerRef.current = setInterval(fetch_, 10 * 60 * 1000) // every 10 min

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active, lat, lon])

  useEffect(() => {
    if (!active) setData(null)
  }, [active])

  return data
}
