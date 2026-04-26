'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { parseVoiceCommand, type ParsedCommand } from '@/lib/voiceCommands'

export interface VoiceState {
  isMuted: boolean
  isHearing: boolean
  isRecognising: boolean
  lastCommand: ParsedCommand | null
  supported: boolean
  toggleMute: () => void
  mute: () => void
  unmute: () => void
}

export function useVoice(onCommand: (cmd: ParsedCommand) => void): VoiceState {
  const [isMuted, setIsMuted] = useState(true)
  const [isHearing, setIsHearing] = useState(false)
  const [isRecognising, setIsRecognising] = useState(false)
  const [lastCommand, setLastCommand] = useState<ParsedCommand | null>(null)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onCommandRef = useRef(onCommand)
  onCommandRef.current = onCommand

  useEffect(() => {
    const SR = (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      ?? (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition

    if (!SR) return
    setSupported(true)

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.maxAlternatives = 1

    rec.onstart = () => setIsHearing(true)
    rec.onend = () => {
      setIsHearing(false)
      setIsRecognising(false)
      // Auto-restart if still unmuted (browser closes recognition on silence)
      if (recognitionRef.current && !isMutedRef.current) {
        try { rec.start() } catch { /* already started */ }
      }
    }
    rec.onspeechstart = () => setIsRecognising(true)
    rec.onspeechend = () => setIsRecognising(false)

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      const confidence = e.results[e.results.length - 1][0].confidence

      if (confidence < 0.75) return

      const cmd = parseVoiceCommand(transcript)
      if (cmd) {
        setLastCommand(cmd)
        onCommandRef.current(cmd)
      }
    }

    recognitionRef.current = rec

    return () => {
      try { rec.stop() } catch { /* ignore */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep a mutable ref so the onend handler sees current mute state
  const isMutedRef = useRef(true)

  const unmute = useCallback(() => {
    isMutedRef.current = false
    setIsMuted(false)
    if (recognitionRef.current) {
      try { recognitionRef.current.start() } catch { /* already running */ }
    }
  }, [])

  const mute = useCallback(() => {
    isMutedRef.current = true
    setIsMuted(true)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (isMutedRef.current) unmute()
    else mute()
  }, [mute, unmute])

  // Auto-mute when page goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) mute()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [mute])

  return { isMuted, isHearing, isRecognising, lastCommand, supported, toggleMute, mute, unmute }
}
