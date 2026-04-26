export type SpeedAlertLevel = 'ok' | 'warning' | 'danger'

/**
 * Compare current speed against the posted limit.
 * warning: within 10% of limit
 * danger:  10%+ over limit
 * Uses upper threshold for trigger (≥1.1) and lower for dismiss (≥1.05) to add hysteresis.
 */
export function getSpeedAlertLevel(speedKmh: number, limitKmh: number | null): SpeedAlertLevel {
  if (limitKmh === null || limitKmh <= 0) return 'ok'
  const ratio = speedKmh / limitKmh
  if (ratio >= 1.1) return 'danger'
  if (ratio >= 0.9) return 'warning'
  return 'ok'
}

/** Hysteresis dismiss threshold — require speed to drop below 105% before clearing an active alert */
export function isSpeedAlertDismissable(speedKmh: number, limitKmh: number | null): boolean {
  if (limitKmh === null || limitKmh <= 0) return true
  return speedKmh / limitKmh < 1.05
}

/** Color for the speed arc based on alert level */
export function speedArcColor(level: SpeedAlertLevel, limitKnown: boolean): string {
  if (!limitKnown) return 'var(--accent)'
  switch (level) {
    case 'danger':  return '#ef4444'
    case 'warning': return '#f59e0b'
    default:        return '#22c55e'
  }
}

/** Max speed for arc/hand scaling: 150% of limit, minimum 120 km/h */
export function computeMaxSpeed(limitKmh: number | null): number {
  return limitKmh ? Math.max(limitKmh * 1.5, 120) : 180
}
