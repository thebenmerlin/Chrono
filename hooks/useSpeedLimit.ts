'use client'

import { useState, useEffect, useRef } from 'react'

export interface SpeedLimitData {
  limit_kmh: number | null
  limit_mph: number | null
  road_name: string | null
}

export function useSpeedLimit(lat: number | null, lon: number | null, active = false): SpeedLimitData | null {
  const [data, setData] = useState<SpeedLimitData | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active || lat === null || lon === null) return

    async function fetch_() {
      try {
        const res = await fetch(`/api/speedlimit?lat=${lat}&lon=${lon}`)
        if (!res.ok) return
        const json = await res.json()
        setData(json)
      } catch {
        // keep last value on network error
      }
    }

    fetch_()
    timerRef.current = setInterval(fetch_, 30_000) // every 30 s

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [active, lat, lon])

  useEffect(() => {
    if (!active) setData(null)
  }, [active])

  return data
}
