import type { VcDay, VcResponse, VcWeatherRecord } from '../lib/types'

/** 2026-10-24T12:00:00Z - a Saturday, safely inside the fixture's range. */
export const NOW_EPOCH = Date.UTC(2026, 9, 24, 12, 0, 0) / 1_000
const FIRST_DAY = Date.UTC(2026, 9, 23, 0, 0, 0) / 1_000
const DAY_SECONDS = 24 * 60 * 60

function hourlyRecord(dayStart: number, hour: number): VcWeatherRecord {
  const isDay = hour >= 6 && hour < 19
  return {
    datetime: new Date((dayStart + hour * 3600) * 1_000).toISOString().slice(0, 13),
    datetimeEpoch: dayStart + hour * 3600,
    temp: 12 + (hour % 10),
    feelslike: 11 + (hour % 10),
    humidity: 55 + (hour % 20),
    precipprob: (hour * 3) % 100,
    precip: hour % 4 === 0 ? 0.2 : 0,
    windspeed: 6 + (hour % 14),
    windgust: 12 + (hour % 10),
    winddir: (hour * 15) % 360,
    pressure: 1008 + (hour % 8),
    visibility: 14 + (hour % 6),
    cloudcover: (hour * 4) % 100,
    uvindex: isDay ? hour % 9 : 0,
    conditions: isDay ? 'Clear' : 'Clear',
    icon: isDay ? 'clear-day' : 'clear-night',
  }
}

function makeDay(dayStart: number, index: number): VcDay {
  const hours = Array.from({ length: 24 }, (_, hour) => hourlyRecord(dayStart, hour))
  const temps = hours.map((hour) => hour.temp ?? 0)

  return {
    datetime: new Date(dayStart * 1_000).toISOString().slice(0, 10),
    datetimeEpoch: dayStart,
    tempmax: Math.max(...temps),
    tempmin: Math.min(...temps),
    sunrise: '06:04:12',
    sunset: '18:21:40',
    conditions: index === 1 ? 'Partly cloudy' : 'Clear',
    icon: 'clear-day',
    description: `Fixture day ${index + 1}`,
    hours,
  }
}

/** Five deterministic days (two before "today", two after) of hourly data. */
export function makeResponse(overrides: Partial<VcResponse> = {}): VcResponse {
  const days = Array.from({ length: 5 }, (_, index) => makeDay(FIRST_DAY + index * DAY_SECONDS, index))

  return {
    address: 'fixture, city',
    resolvedAddress: 'Fixture City, Testland',
    timezone: 'UTC',
    tzoffset: 0,
    description: 'A clear, mild test day.',
    days,
    currentConditions: {
      datetimeEpoch: NOW_EPOCH,
      temp: 21.5,
      feelslike: 22.1,
      humidity: 64,
      precipprob: 18,
      precip: 0.4,
      windspeed: 12.4,
      windgust: 20.2,
      winddir: 135,
      pressure: 1012,
      visibility: 16,
      cloudcover: 24,
      uvindex: 5,
      conditions: 'Partly cloudy',
      icon: 'partly-cloudy-day',
    },
    ...overrides,
  }
}
