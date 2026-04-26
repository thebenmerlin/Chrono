'use client'

import { useState, useEffect, useRef } from 'react'

export interface SpeedLimitData {
  limit_kmh: number | null
  limit_mph: number | null
  road_name: string | null
  inferred: boolean   // true when limit is guessed from road type, not from OSM maxspeed tag
}

function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export function useSpeedLimit(lat: number | null, lon: number | null, active = false): SpeedLimitData | null {
  const [data, setData] = useState<SpeedLimitData | null>(null)
  const lastQueryPos = useRef<{ lat: number; lon: number } | null>(null)
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef      = useRef<AbortController | null>(null)

  function stopAll() {
    abortRef.current?.abort()
    abortRef.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Core fetch: captures lat/lon at the time of the call; uses its own AbortController
  async function doFetch(fetchLat: number, fetchLon: number) {
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      const res = await fetch(`/api/speedlimit?lat=${fetchLat}&lon=${fetchLon}`, { signal: ctrl.signal })
      if (!res.ok) return
      const json = await res.json()
      if (!ctrl.signal.aborted) setData(json)
    } catch {
      // keep last value on network error or intentional abort
    }
  }

  useEffect(() => {
    if (!active || lat === null || lon === null) {
      stopAll()
      lastQueryPos.current = null
      return
    }

    const currentPos = { lat, lon }
    const lastPos    = lastQueryPos.current
    const movedEnough = !lastPos || haversineMeters(lastPos, currentPos) > 50

    // Only restart the fetch + interval when location has changed significantly (>50 m)
    if (!movedEnough) return

    lastQueryPos.current = currentPos
    stopAll()  // cancel any in-flight request from previous position

    doFetch(lat, lon)
    intervalRef.current = setInterval(() => doFetch(lat, lon), 30_000)
  }, [active, lat, lon])  // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => stopAll(), [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Clear stale data when going inactive
  useEffect(() => {
    if (!active) {
      setData(null)
      lastQueryPos.current = null
    }
  }, [active])

  return data
}
