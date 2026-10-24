import type {
  CurrentWeather,
  HourPoint,
  TodaySummary,
  VcDay,
  VcResponse,
  VcWeatherRecord,
  WeatherSnapshot,
} from './types'

const HOUR_SECONDS = 60 * 60
const WINDOW_SECONDS = 24 * HOUR_SECONDS

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function hasTemperature(record: VcWeatherRecord | undefined): boolean {
  return finite(record?.temp) !== null
}

/** Shallow merge that lets real values from `override` win over `base`. */
function withoutEmpty(record: VcWeatherRecord | undefined): Partial<VcWeatherRecord> {
  if (!record) return {}
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== null && value !== undefined),
  ) as Partial<VcWeatherRecord>
}

function nearestRecord(
  records: VcWeatherRecord[],
  targetEpoch: number,
): VcWeatherRecord | undefined {
  let nearest: VcWeatherRecord | undefined
  let smallestDistance = Number.POSITIVE_INFINITY

  for (const record of records) {
    const epoch = finite(record.datetimeEpoch)
    if (epoch === null) continue
    const distance = Math.abs(epoch - targetEpoch)
    if (distance < smallestDistance) {
      nearest = record
      smallestDistance = distance
    }
  }

  return nearest
}

function toHourPoint(record: VcWeatherRecord): HourPoint | null {
  const epoch = finite(record.datetimeEpoch)
  const temp = finite(record.temp)
  if (epoch === null || temp === null) return null

  const icon = text(record.icon, 'cloudy')
  return {
    epoch,
    tempC: temp,
    precipProb: finite(record.precipprob),
    windKph: finite(record.windspeed) ?? 0,
    conditions: text(record.conditions, 'Unknown conditions'),
    icon,
    isDay: !icon.includes('night'),
  }
}

function timeFromIso(value: string | undefined): string | null {
  if (!value) return null
  const match = value.match(/(\d{1,2}):(\d{2})/)
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null
}

function dayRange(day: VcDay): { highC: number | null; lowC: number | null } {
  const highs: number[] = []
  const lows: number[] = []

  for (const hour of day.hours ?? []) {
    const temp = finite(hour.temp)
    if (temp === null) continue
    highs.push(temp)
    lows.push(temp)
  }

  return {
    highC: finite(day.tempmax) ?? (highs.length ? Math.max(...highs) : null),
    lowC: finite(day.tempmin) ?? (lows.length ? Math.min(...lows) : null),
  }
}

function findToday(days: VcDay[], nowEpoch: number): VcDay | null {
  let candidate: VcDay | null = null
  let candidateEpoch = Number.NEGATIVE_INFINITY

  for (const day of days) {
    const epoch = finite(day.datetimeEpoch)
    if (epoch !== null && epoch <= nowEpoch && epoch > candidateEpoch) {
      candidate = day
      candidateEpoch = epoch
    }
  }

  return candidate ?? days[0] ?? null
}

function buildToday(days: VcDay[], nowEpoch: number): TodaySummary | null {
  const day = findToday(days, nowEpoch)
  if (!day) return null

  const range = dayRange(day)
  return {
    highC: range.highC,
    lowC: range.lowC,
    sunrise: timeFromIso(day.sunrise),
    sunset: timeFromIso(day.sunset),
  }
}

/**
 * Turns the raw Visual Crossing response into the compact model used by the UI.
 *
 * `past` holds the 24 hourly records up to (and including) the current hour and
 * `future` holds the 24 hours after it. Both are chronological.
 */
export function buildSnapshot(
  data: VcResponse,
  nowEpoch: number = Math.floor(Date.now() / 1000),
): WeatherSnapshot {
  const days = Array.isArray(data.days) ? data.days : []
  const rawHours: VcWeatherRecord[] = []

  for (const day of days) {
    if (Array.isArray(day.hours)) rawHours.push(...day.hours)
  }

  const uniqueHours = new Map<number, HourPoint>()
  for (const record of rawHours) {
    const point = toHourPoint(record)
    if (point) uniqueHours.set(point.epoch, point)
  }
  const hours = [...uniqueHours.values()].sort((a, b) => a.epoch - b.epoch)

  const nearest = nearestRecord(rawHours, nowEpoch)
  const currentRecord: VcWeatherRecord = {
    ...nearest,
    ...withoutEmpty(hasTemperature(data.currentConditions) ? data.currentConditions : undefined),
  }

  const tempC = finite(currentRecord.temp)
  if (tempC === null) {
    throw new Error("We couldn't read the current conditions for this location. Please try again.")
  }

  const icon = text(currentRecord.icon, 'cloudy')
  const current: CurrentWeather = {
    epoch: finite(currentRecord.datetimeEpoch) ?? nowEpoch,
    tempC,
    feelsLikeC: finite(currentRecord.feelslike) ?? tempC,
    humidity: finite(currentRecord.humidity),
    windKph: finite(currentRecord.windspeed) ?? 0,
    windGustKph: finite(currentRecord.windgust),
    windDirectionDeg: finite(currentRecord.winddir),
    precipProb: finite(currentRecord.precipprob),
    precipMm: finite(currentRecord.precip),
    pressureHpa: finite(currentRecord.pressure),
    visibilityKm: finite(currentRecord.visibility),
    cloudCover: finite(currentRecord.cloudcover),
    uvIndex: finite(currentRecord.uvindex),
    conditions: text(currentRecord.conditions, 'Current conditions'),
    icon,
    isDay: !icon.includes('night'),
  }

  const past = hours
    .filter((hour) => hour.epoch <= nowEpoch && hour.epoch > nowEpoch - WINDOW_SECONDS)
    .slice(-24)
  const future = hours
    .filter((hour) => hour.epoch > nowEpoch && hour.epoch <= nowEpoch + WINDOW_SECONDS)
    .slice(0, 24)

  return {
    location: text(data.resolvedAddress) || text(data.address) || 'Selected location',
    timezone: text(data.timezone, 'UTC'),
    description: text(data.description, current.conditions),
    current,
    today: buildToday(days, nowEpoch),
    past,
    future,
  }
}
