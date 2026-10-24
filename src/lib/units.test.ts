import { describe, expect, it } from 'vitest'
import {
  compassDirection,
  cToF,
  displayTemp,
  formatPrecip,
  formatPressure,
  formatTemp,
  formatVisibility,
  formatWind,
  percentOrDash,
  unitLabel,
  uvDescription,
} from './units'

describe('temperature conversion', () => {
  it('converts Celsius to Fahrenheit at known points', () => {
    expect(cToF(0)).toBe(32)
    expect(cToF(100)).toBe(212)
    expect(cToF(-40)).toBe(-40)
    expect(cToF(37)).toBeCloseTo(98.6, 5)
  })

  it('returns the requested display unit', () => {
    expect(displayTemp(20, 'c')).toBe(20)
    expect(displayTemp(20, 'f')).toBe(68)
  })

  it('formats temperatures with a degree sign and no unit', () => {
    expect(formatTemp(21.4, 'c')).toBe('21°')
    expect(formatTemp(21.6, 'c')).toBe('22°')
    expect(formatTemp(0, 'f')).toBe('32°')
    expect(formatTemp(-7.2, 'c')).toBe('-7°')
  })

  it('labels the unit toggle', () => {
    expect(unitLabel('c')).toBe('°C')
    expect(unitLabel('f')).toBe('°F')
  })
})

describe('wind, visibility, pressure and precipitation', () => {
  it('formats wind in the matching unit', () => {
    expect(formatWind(12.4, 'c')).toBe('12 km/h')
    expect(formatWind(100, 'f')).toBe('62 mph')
    expect(formatWind(0, 'c')).toBe('0 km/h')
  })

  it('formats visibility', () => {
    expect(formatVisibility(16, 'c')).toBe('16 km')
    expect(formatVisibility(16, 'f')).toBe('10 mi')
  })

  it('formats pressure', () => {
    expect(formatPressure(1012, 'c')).toBe('1012 hPa')
    expect(formatPressure(1012, 'f')).toBe('29.88 inHg')
  })

  it('formats precipitation and keeps zero clean', () => {
    expect(formatPrecip(0, 'c')).toBe('0 mm')
    expect(formatPrecip(0, 'f')).toBe('0 in')
    expect(formatPrecip(0.44, 'c')).toBe('0.4 mm')
    expect(formatPrecip(25.4, 'f')).toBe('1.00 in')
  })

  it('renders unknown percentages as an em dash', () => {
    expect(percentOrDash(null)).toBe('—')
    expect(percentOrDash(18.4)).toBe('18%')
    expect(percentOrDash(0)).toBe('0%')
  })
})

describe('compassDirection', () => {
  it('maps the cardinal and intercardinal points', () => {
    expect(compassDirection(0)).toBe('N')
    expect(compassDirection(22.5)).toBe('NNE')
    expect(compassDirection(45)).toBe('NE')
    expect(compassDirection(90)).toBe('E')
    expect(compassDirection(180)).toBe('S')
    expect(compassDirection(270)).toBe('W')
    expect(compassDirection(315)).toBe('NW')
  })

  it('wraps values outside 0-360', () => {
    expect(compassDirection(360)).toBe('N')
    expect(compassDirection(361)).toBe('N')
    expect(compassDirection(-90)).toBe('W')
    expect(compassDirection(720)).toBe('N')
  })

  it('returns an em dash for missing values', () => {
    expect(compassDirection(null)).toBe('—')
    expect(compassDirection(Number.NaN)).toBe('—')
    expect(compassDirection(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('uvDescription', () => {
  it('bands the index using the WHO scale', () => {
    expect(uvDescription(0)).toBe('Low')
    expect(uvDescription(2.9)).toBe('Low')
    expect(uvDescription(3)).toBe('Moderate')
    expect(uvDescription(5.5)).toBe('Moderate')
    expect(uvDescription(6)).toBe('High')
    expect(uvDescription(8)).toBe('Very high')
    expect(uvDescription(10.5)).toBe('Very high')
    expect(uvDescription(11)).toBe('Extreme')
  })

  it('handles missing values', () => {
    expect(uvDescription(null)).toBe('Not available')
    expect(uvDescription(Number.NaN)).toBe('Not available')
  })
})
