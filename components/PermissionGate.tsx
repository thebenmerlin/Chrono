'use client'

import { ReactNode } from 'react'

interface PermissionGateProps {
  requires: 'geolocation' | 'orientation' | 'microphone' | 'camera'
  granted: boolean
  denied: boolean
  onRequest: () => void
  children: ReactNode
}

export default function PermissionGate({ requires, granted, denied, onRequest, children }: PermissionGateProps) {
  if (granted) return <>{children}</>

  if (denied) {
    return (
      <div className="flex items-center justify-center text-xs tracking-widest" style={{ color: 'var(--text-secondary)' }}>
        <span>⊘ {requires} denied</span>
      </div>
    )
  }

  return (
    <button
      onClick={onRequest}
      className="text-xs tracking-widest underline"
      style={{ color: 'var(--accent)' }}
    >
      Allow {requires}
    </button>
  )
}
