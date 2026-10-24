import { describe, expect, it } from 'vitest'
import { iconAriaLabel, isNightIcon, pickTheme, weatherKind } from './theme'

describe('weatherKind', () => {
  it('maps the Visual Crossing icon set', () => {
    expect(weatherKind('clear-day')).toBe('clear')
    expect(weatherKind('clear-night')).toBe('clear')
    expect(weatherKind('partly-cloudy-day')).toBe('cloudy')
    expect(weatherKind('partly-cloudy-night')).toBe('cloudy')
    expect(weatherKind('cloudy')).toBe('cloudy')
    expect(weatherKind('overcast')).toBe('cloudy')
    expect(weatherKind('rain')).toBe('rain')
    expect(weatherKind('showers-day')).toBe('rain')
    expect(weatherKind('drizzle')).toBe('rain')
    expect(weatherKind('snow')).toBe('snow')
    expect(weatherKind('sleet')).toBe('snow')
    expect(weatherKind('hail')).toBe('snow')
    expect(weatherKind('thunderstorm')).toBe('storm')
    expect(weatherKind('tornado')).toBe('storm')
    expect(weatherKind('fog')).toBe('fog')
    expect(weatherKind('haze')).toBe('fog')
    expect(weatherKind('wind')).toBe('wind')
  })

  it('falls back to cloudy for unknown or empty icons', () => {
    expect(weatherKind('')).toBe('cloudy')
    expect(weatherKind('mystery')).toBe('cloudy')
  })

  it('prioritises storms over rain and snow tokens', () => {
    expect(weatherKind('thunder-rain')).toBe('storm')
    expect(weatherKind('snow-showers')).toBe('snow')
  })
})

describe('isNightIcon', () => {
  it('detects the night suffix', () => {
    expect(isNightIcon('clear-night')).toBe(true)
    expect(isNightIcon('partly-cloudy-night')).toBe(true)
    expect(isNightIcon('clear-day')).toBe(false)
    expect(isNightIcon('cloudy')).toBe(false)
  })
})

describe('pickTheme', () => {
  it('returns a theme for every icon family and time of day', () => {
    expect(pickTheme('clear-day')).toBe('clear-day')
    expect(pickTheme('clear-night')).toBe('clear-night')
    expect(pickTheme('partly-cloudy-day')).toBe('cloudy-day')
    expect(pickTheme('partly-cloudy-night')).toBe('cloudy-night')
    expect(pickTheme('rain')).toBe('rain-day')
    expect(pickTheme('showers-night')).toBe('rain-night')
    expect(pickTheme('thunderstorm')).toBe('storm-day')
    expect(pickTheme('snow')).toBe('snow-day')
    expect(pickTheme('snow-night')).toBe('snow-night')
  })

  it('borrows the cloudy palette for fog and wind', () => {
    expect(pickTheme('fog')).toBe('cloudy-day')
    expect(pickTheme('wind')).toBe('cloudy-day')
  })

  it('always returns a supported theme', () => {
    const supported = new Set([
      'clear-day',
      'clear-night',
      'cloudy-day',
      'cloudy-night',
      'rain-day',
      'rain-night',
      'storm-day',
      'storm-night',
      'snow-day',
      'snow-night',
    ])

    for (const icon of ['clear-day', 'clear-night', 'rain', 'snow', 'fog', 'wind', 'storm']) {
      expect(supported.has(pickTheme(icon))).toBe(true)
    }
  })
})

describe('iconAriaLabel', () => {
  it('prefers the human readable conditions', () => {
    expect(iconAriaLabel('partly-cloudy-day', 'Partly cloudy')).toBe('Partly cloudy')
  })

  it('humanises the icon when conditions are empty', () => {
    expect(iconAriaLabel('partly-cloudy-day', '')).toBe('partly cloudy day')
  })
})
