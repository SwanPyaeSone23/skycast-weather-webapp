export type Unit = 'c' | 'f'

export const C_TO_F_FACTOR = 9 / 5
export const KPH_TO_MPH = 0.621371
export const KM_TO_MILES = 0.621371
export const HPA_TO_INHG = 0.02953
export const MM_TO_INCHES = 0.0393701

export function cToF(celsius: number): number {
  return celsius * C_TO_F_FACTOR + 32
}

export function displayTemp(celsius: number, unit: Unit): number {
  return unit === 'f' ? cToF(celsius) : celsius
}

/** "21°" - the unit is displayed separately next to the hero temperature. */
export function formatTemp(celsius: number, unit: Unit): string {
  return `${Math.round(displayTemp(celsius, unit))}°`
}

export function unitLabel(unit: Unit): string {
  return unit === 'f' ? '°F' : '°C'
}

export function formatWind(kph: number, unit: Unit): string {
  const value = unit === 'f' ? kph * KPH_TO_MPH : kph
  return `${Math.round(value)} ${unit === 'f' ? 'mph' : 'km/h'}`
}

export function formatVisibility(km: number, unit: Unit): string {
  const value = unit === 'f' ? km * KM_TO_MILES : km
  return `${Math.round(value)} ${unit === 'f' ? 'mi' : 'km'}`
}

export function formatPressure(hpa: number, unit: Unit): string {
  return unit === 'f'
    ? `${(hpa * HPA_TO_INHG).toFixed(2)} inHg`
    : `${Math.round(hpa)} hPa`
}

export function formatPrecip(mm: number, unit: Unit): string {
  if (mm === 0) return unit === 'f' ? '0 in' : '0 mm'
  return unit === 'f'
    ? `${(mm * MM_TO_INCHES).toFixed(2)} in`
    : `${mm.toFixed(1)} mm`
}

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const

export function compassDirection(degrees: number | null): string {
  if (degrees === null || !Number.isFinite(degrees)) return '—'
  const normalised = ((degrees % 360) + 360) % 360
  return COMPASS[Math.round(normalised / 22.5) % 16]
}

export function uvDescription(index: number | null): string {
  if (index === null || !Number.isFinite(index)) return 'Not available'
  if (index < 3) return 'Low'
  if (index < 6) return 'Moderate'
  if (index < 8) return 'High'
  if (index < 11) return 'Very high'
  return 'Extreme'
}

export function percentOrDash(value: number | null): string {
  return value === null ? '—' : `${Math.round(value)}%`
}
