import type { Unit } from './units'

const STORAGE_KEYS = {
  apiKey: 'skycast.apiKey',
  unit: 'skycast.unit',
  lastLocation: 'skycast.lastLocation',
} as const

const envApiKey = (import.meta.env.VITE_VISUAL_CROSSING_API_KEY ?? '').trim()

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    lower.length === 0 ||
    lower.startsWith('your') ||
    lower.startsWith('paste') ||
    lower.startsWith('replace') ||
    lower.includes('<') ||
    lower.includes('your_visual_crossing')
  )
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Storage can be disabled (private mode, blocked cookies). Fail soft.
    return null
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** A key baked in at build time (e.g. via Vite's .env) is used as a fallback. */
export const hasEnvironmentKey = !isPlaceholder(envApiKey)

export function getStoredApiKey(): string {
  const stored = read(STORAGE_KEYS.apiKey)
  return stored && !isPlaceholder(stored) ? stored.trim() : ''
}

export function resolveApiKey(): string {
  return getStoredApiKey() || (hasEnvironmentKey ? envApiKey : '')
}

export function saveApiKey(key: string): void {
  write(STORAGE_KEYS.apiKey, key.trim())
}

export function clearApiKey(): void {
  remove(STORAGE_KEYS.apiKey)
}

export function getUnit(): Unit {
  return read(STORAGE_KEYS.unit) === 'f' ? 'f' : 'c'
}

export function saveUnit(unit: Unit): void {
  write(STORAGE_KEYS.unit, unit)
}

export function getLastLocation(): string {
  return read(STORAGE_KEYS.lastLocation)?.trim() ?? ''
}

export function saveLastLocation(location: string): void {
  write(STORAGE_KEYS.lastLocation, location.trim())
}
