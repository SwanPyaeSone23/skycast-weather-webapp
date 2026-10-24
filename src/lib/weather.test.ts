import { describe, expect, it } from 'vitest'
import { buildSnapshot } from './weather'
import { makeResponse, NOW_EPOCH } from '../test/fixture'

describe('buildSnapshot', () => {
  it('exposes the resolved address, timezone and description', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)

    expect(snapshot.location).toBe('Fixture City, Testland')
    expect(snapshot.timezone).toBe('UTC')
    expect(snapshot.description).toBe('A clear, mild test day.')
  })

  it('merges current conditions over the nearest hourly record', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)
    const { current } = snapshot

    expect(current.tempC).toBe(21.5)
    expect(current.feelsLikeC).toBe(22.1)
    expect(current.humidity).toBe(64)
    expect(current.windKph).toBe(12.4)
    expect(current.windGustKph).toBe(20.2)
    expect(current.windDirectionDeg).toBe(135)
    expect(current.precipProb).toBe(18)
    expect(current.precipMm).toBe(0.4)
    expect(current.pressureHpa).toBe(1012)
    expect(current.visibilityKm).toBe(16)
    expect(current.uvIndex).toBe(5)
    expect(current.conditions).toBe('Partly cloudy')
    expect(current.icon).toBe('partly-cloudy-day')
    expect(current.isDay).toBe(true)
  })

  it('falls back to the nearest hour when currentConditions is absent', () => {
    const response = makeResponse()
    delete response.currentConditions

    const snapshot = buildSnapshot(response, NOW_EPOCH)

    // Noon on the fixture is hour 12: 12 + (12 % 10) = 14°C.
    expect(snapshot.current.tempC).toBe(14)
    expect(snapshot.current.icon).toBe('clear-day')
  })

  it('returns exactly 24 chronological hours in each direction', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)

    expect(snapshot.past).toHaveLength(24)
    expect(snapshot.future).toHaveLength(24)

    expect(snapshot.past.at(-1)?.epoch).toBe(NOW_EPOCH)
    expect(snapshot.past[0].epoch).toBe(NOW_EPOCH - 23 * 3600)
    expect(snapshot.future[0].epoch).toBe(NOW_EPOCH + 3600)
    expect(snapshot.future.at(-1)?.epoch).toBe(NOW_EPOCH + 24 * 3600)

    for (let index = 1; index < snapshot.past.length; index += 1) {
      expect(snapshot.past[index].epoch).toBeGreaterThan(snapshot.past[index - 1].epoch)
      expect(snapshot.future[index].epoch).toBeGreaterThan(snapshot.future[index - 1].epoch)
    }
  })

  it('never includes future hours in the past window, or vice versa', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)

    expect(snapshot.past.every((hour) => hour.epoch <= NOW_EPOCH)).toBe(true)
    expect(snapshot.future.every((hour) => hour.epoch > NOW_EPOCH)).toBe(true)
    expect(snapshot.past.every((hour) => hour.epoch > NOW_EPOCH - 86_400)).toBe(true)
    expect(snapshot.future.every((hour) => hour.epoch <= NOW_EPOCH + 86_400)).toBe(true)
  })

  it('normalises each hour into the UI model', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)
    const [first] = snapshot.past

    expect(first).toEqual({
      epoch: NOW_EPOCH - 23 * 3600,
      tempC: 15,
      precipProb: 39,
      windKph: 19,
      conditions: 'Clear',
      icon: 'clear-day',
      isDay: true,
    })
  })

  it('summarises today, including sunrise and sunset without seconds', () => {
    const snapshot = buildSnapshot(makeResponse(), NOW_EPOCH)

    expect(snapshot.today).not.toBeNull()
    expect(snapshot.today?.highC).toBe(21)
    expect(snapshot.today?.lowC).toBe(12)
    expect(snapshot.today?.sunrise).toBe('06:04')
    expect(snapshot.today?.sunset).toBe('18:21')
  })

  it('falls back to hourly extremes when day max/min are missing', () => {
    const response = makeResponse()
    for (const day of response.days ?? []) {
      day.tempmax = null
      day.tempmin = null
    }

    const snapshot = buildSnapshot(response, NOW_EPOCH)

    expect(snapshot.today?.highC).toBe(21)
    expect(snapshot.today?.lowC).toBe(12)
  })

  it('deduplicates repeated hourly records', () => {
    const response = makeResponse()
    const duplicate = response.days?.[0]?.hours?.[0]
    if (duplicate) response.days?.[0]?.hours?.push({ ...duplicate })

    const snapshot = buildSnapshot(response, NOW_EPOCH)

    expect(snapshot.past).toHaveLength(24)
    expect(snapshot.future).toHaveLength(24)
  })

  it('ignores hours without a temperature or timestamp', () => {
    const response = makeResponse()
    response.days?.[1]?.hours?.push({ datetimeEpoch: NOW_EPOCH, icon: 'rain' })

    const snapshot = buildSnapshot(response, NOW_EPOCH)

    expect(snapshot.past.every((hour) => Number.isFinite(hour.tempC))).toBe(true)
  })

  it('falls back gracefully for missing metadata', () => {
    const response = makeResponse({
      address: '',
      resolvedAddress: '',
      timezone: undefined,
      description: undefined,
      days: [],
    })

    const snapshot = buildSnapshot(response, NOW_EPOCH)

    expect(snapshot.location).toBe('Selected location')
    expect(snapshot.timezone).toBe('UTC')
    expect(snapshot.description).toBe('Partly cloudy')
    expect(snapshot.today).toBeNull()
    expect(snapshot.past).toEqual([])
    expect(snapshot.future).toEqual([])
    expect(snapshot.current.tempC).toBe(21.5)
  })

  it('throws a friendly error when no temperature can be read at all', () => {
    const response = makeResponse({ days: [], currentConditions: { icon: 'cloudy' } })

    expect(() => buildSnapshot(response, NOW_EPOCH)).toThrow(/couldn't read the current conditions/i)
  })

  it('keeps isDay consistent with the Visual Crossing icon', () => {
    const response = makeResponse()
    response.currentConditions = {
      ...response.currentConditions,
      icon: 'partly-cloudy-night',
    }

    expect(buildSnapshot(response, NOW_EPOCH).current.isDay).toBe(false)
  })
})
