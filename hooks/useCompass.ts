'use client'

import { useState, useEffect, useRef } from 'react'

export interface CompassData {
  bearing: number | null   // 0–360, null if unavailable
  supported: boolean
  permissionState: 'unknown' | 'granted' | 'denied' | 'prompt'
}

export function useCompass(): CompassData {
  const [bearing, setBearing] = useState<number | null>(null)
  const [supported, setSupported] = useState(false)
  const [permissionState, setPermissionState] = useState<CompassData['permissionState']>('unknown')
  const lastBearing = useRef<number | null>(null)

  useEffect(() => {
    if (!('DeviceOrientationEvent' in window)) {
      setSupported(false)
      return
    }
    setSupported(true)

    function handleOrientation(e: DeviceOrientationEvent) {
      // webkitCompassHeading is the iOS standard; alpha fallback for Android
      const raw =
        (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading ??
        (e.alpha !== null ? (360 - e.alpha) % 360 : null)

      if (raw === null) return

      // Jitter damping: only update if changed by more than 2°
      if (lastBearing.current !== null && Math.abs(raw - lastBearing.current) < 2) return
      lastBearing.current = raw
      setBearing(Math.round(raw))
      setPermissionState('granted')
    }

    // iOS 13+ requires explicit permission
    type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<string>
    }
    const DOE = DeviceOrientationEvent as DeviceOrientationEventStatic
    if (typeof DOE.requestPermission === 'function') {
      setPermissionState('prompt')
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true)
      setPermissionState('granted')
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  return { bearing, supported, permissionState }
}

export async function requestCompassPermission(): Promise<boolean> {
  type DeviceOrientationEventStatic = typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<string>
  }
  const DOE = DeviceOrientationEvent as DeviceOrientationEventStatic
  if (typeof DOE.requestPermission !== 'function') return true
  try {
    const result = await DOE.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}
