export type WeatherKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'wind'

export type Theme =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'rain-day'
  | 'rain-night'
  | 'storm-day'
  | 'storm-night'
  | 'snow-day'
  | 'snow-night'

const RAIN = ['rain', 'shower', 'drizzle']
const SNOW = ['snow', 'sleet', 'ice', 'hail']
const STORM = ['thunder', 'storm', 'tornado', 'hurricane']
const FOG = ['fog', 'mist', 'haze']
const CLOUD = ['cloud', 'overcast', 'partly']
const WIND = ['wind']

/** Maps a Visual Crossing icon id to one of our illustrated variants. */
export function weatherKind(icon: string): WeatherKind {
  const value = icon.toLowerCase()
  if (STORM.some((token) => value.includes(token))) return 'storm'
  if (SNOW.some((token) => value.includes(token))) return 'snow'
  if (RAIN.some((token) => value.includes(token))) return 'rain'
  if (FOG.some((token) => value.includes(token))) return 'fog'
  if (WIND.some((token) => value.includes(token))) return 'wind'
  if (CLOUD.some((token) => value.includes(token))) return 'cloudy'
  if (value.includes('clear') || value.includes('sun')) return 'clear'
  return 'cloudy'
}

export function isNightIcon(icon: string): boolean {
  return icon.toLowerCase().includes('night')
}

/** Minimum theme set: fog/wind borrow the cloudy palette. */
export function pickTheme(icon: string): Theme {
  const kind = weatherKind(icon)
  const night = isNightIcon(icon)
  const base: 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' =
    kind === 'fog' || kind === 'wind' ? 'cloudy' : kind === 'partly' ? 'cloudy' : kind
  return `${base}-${night ? 'night' : 'day'}` as Theme
}

export function iconAriaLabel(icon: string, conditions: string): string {
  return conditions || icon.replace(/-/g, ' ')
}
