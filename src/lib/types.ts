/** Raw shapes returned by the Visual Crossing Timeline API (only the fields we use). */

export interface VcWeatherRecord {
  datetime?: string
  datetimeEpoch?: number
  temp?: number
  feelslike?: number
  humidity?: number | null
  precipprob?: number | null
  precip?: number | null
  windspeed?: number | null
  windgust?: number | null
  winddir?: number | null
  pressure?: number | null
  visibility?: number | null
  cloudcover?: number | null
  uvindex?: number | null
  conditions?: string
  icon?: string
}

export interface VcDay extends VcWeatherRecord {
  tempmax?: number | null
  tempmin?: number | null
  sunrise?: string
  sunset?: string
  description?: string
  hours?: VcWeatherRecord[]
}

export interface VcResponse {
  address?: string
  resolvedAddress?: string
  timezone?: string
  tzoffset?: number
  description?: string
  days?: VcDay[]
  currentConditions?: VcWeatherRecord
}

/** Normalised, UI-friendly shapes. */

export interface HourPoint {
  epoch: number
  tempC: number
  precipProb: number | null
  windKph: number
  conditions: string
  icon: string
  isDay: boolean
}

export interface CurrentWeather {
  epoch: number
  tempC: number
  feelsLikeC: number
  humidity: number | null
  windKph: number
  windGustKph: number | null
  windDirectionDeg: number | null
  precipProb: number | null
  precipMm: number | null
  pressureHpa: number | null
  visibilityKm: number | null
  cloudCover: number | null
  uvIndex: number | null
  conditions: string
  icon: string
  isDay: boolean
}

export interface TodaySummary {
  highC: number | null
  lowC: number | null
  sunrise: string | null
  sunset: string | null
}

export interface WeatherSnapshot {
  location: string
  timezone: string
  description: string
  current: CurrentWeather
  today: TodaySummary | null
  past: HourPoint[]
  future: HourPoint[]
}
