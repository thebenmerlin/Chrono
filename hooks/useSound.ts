'use client'

import { useRef, useCallback } from 'react'

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return ctxRef.current
  }

  const click = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const ctx = getCtx()
      const bufferSize = Math.floor(ctx.sampleRate * 0.018) // ~18ms noise burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        // White noise with exponential decay envelope
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer

      // High-pass filter to get a crisp tick character
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 1200

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.018)

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()
    } catch {
      // AudioContext unavailable or blocked — silently skip
    }
  }, [])

  return { click }
}
