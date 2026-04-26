export type SpeedAlertLevel = 'ok' | 'warning' | 'danger'

/**
 * Compare current speed against the posted limit.
 * warning: within 10% of limit
 * danger:  10%+ over limit
 */
export function getSpeedAlertLevel(speedKmh: number, limitKmh: number | null): SpeedAlertLevel {
  if (limitKmh === null || limitKmh <= 0) return 'ok'
  const ratio = speedKmh / limitKmh
  if (ratio >= 1.1) return 'danger'
  if (ratio >= 0.9) return 'warning'
  return 'ok'
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
