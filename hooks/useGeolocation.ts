'use client'

import { useState, useEffect } from 'react'

export interface GeolocationData {
  lat: number | null
  lon: number | null
  speed: number | null        // m/s
  heading: number | null      // degrees
  accuracy: number | null
  permissionState: 'unknown' | 'granted' | 'denied' | 'prompt'
  error: string | null
}

export function useGeolocation(active = false): GeolocationData {
  const [data, setData] = useState<GeolocationData>({
    lat: null,
    lon: null,
    speed: null,
    heading: null,
    accuracy: null,
    permissionState: 'unknown',
    error: null,
  })

  useEffect(() => {
    if (!active || !('geolocation' in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setData({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
          permissionState: 'granted',
          error: null,
        })
      },
      (err) => {
        setData((prev) => ({
          ...prev,
          permissionState: err.code === 1 ? 'denied' : 'unknown',
          error: err.message,
        }))
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [active])

  return data
}
