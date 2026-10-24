/**
 * Locale-aware time formatting in the *location's* time zone.
 * Visual Crossing returns IANA zone names, so Intl does the heavy lifting.
 */

type TimeStyle = 'hour' | 'clock' | 'weekday'

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function formatter(timeZone: string, style: TimeStyle): Intl.DateTimeFormat {
  const key = `${timeZone}|${style}`
  const cached = formatterCache.get(key)
  if (cached) return cached

  const options: Intl.DateTimeFormatOptions =
    style === 'hour'
      ? { hour: 'numeric' }
      : style === 'clock'
        ? { hour: 'numeric', minute: '2-digit' }
        : { weekday: 'short' }

  let instance: Intl.DateTimeFormat
  try {
    instance = new Intl.DateTimeFormat(undefined, { ...options, timeZone })
  } catch {
    // Unknown/invalid IANA zone from the API: fall back to UTC rather than crash.
    instance = new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' })
  }

  formatterCache.set(key, instance)
  return instance
}

export function formatHour(epochSeconds: number, timeZone: string): string {
  return formatter(timeZone, 'hour').format(new Date(epochSeconds * 1000))
}

export function formatClock(epochSeconds: number, timeZone: string): string {
  return formatter(timeZone, 'clock').format(new Date(epochSeconds * 1000))
}

export function formatWeekday(epochSeconds: number, timeZone: string): string {
  return formatter(timeZone, 'weekday').format(new Date(epochSeconds * 1000))
}

/** Stable yyyy-mm-dd key in the location's zone, used to spot midnight boundaries. */
export function formatDateKey(epochSeconds: number, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    }).format(new Date(epochSeconds * 1000))
  } catch {
    return new Date(epochSeconds * 1000).toISOString().slice(0, 10)
  }
}

/** "06:12" - used for sunrise/sunset strings such as "06:12:00" or ISO datetimes. */
export function shortTime(value: string | null | undefined): string {
  if (!value) return '—'
  const match = value.match(/(\d{1,2}):(\d{2})/)
  if (!match) return value
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

/** Shown in the footer so it is obvious which clock the hours refer to. */
export function friendlyTimeZone(timeZone: string): string {
  return timeZone.replace(/_/g, ' ').replace(/\//g, ' · ')
}
