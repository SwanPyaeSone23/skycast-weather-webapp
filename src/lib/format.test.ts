import { describe, expect, it } from 'vitest'
import { friendlyTimeZone, formatClock, formatDateKey, formatHour, shortTime } from './format'

const NOON_UTC = Date.UTC(2026, 9, 24, 12, 0, 0) / 1_000

describe('shortTime', () => {
  it('trims seconds from Visual Crossing time strings', () => {
    expect(shortTime('06:04:12')).toBe('06:04')
    expect(shortTime('18:21:40')).toBe('18:21')
  })

  it('pads single-digit hours and accepts ISO datetimes', () => {
    expect(shortTime('6:04:00')).toBe('06:04')
    expect(shortTime('2026-10-24T06:04:00')).toBe('06:04')
  })

  it('returns an em dash for missing values', () => {
    expect(shortTime(null)).toBe('—')
    expect(shortTime(undefined)).toBe('—')
    expect(shortTime('')).toBe('—')
  })

  it('returns unparseable input untouched', () => {
    expect(shortTime('sunrise')).toBe('sunrise')
  })
})

describe('friendlyTimeZone', () => {
  it('turns an IANA zone into readable text', () => {
    expect(friendlyTimeZone('America/New_York')).toBe('America · New York')
    expect(friendlyTimeZone('Asia/Yangon')).toBe('Asia · Yangon')
    expect(friendlyTimeZone('UTC')).toBe('UTC')
  })
})

describe('formatting in the location time zone', () => {
  it('renders the hour in the requested zone', () => {
    const utcHour = formatHour(NOON_UTC, 'UTC')
    const tokyoHour = formatHour(NOON_UTC, 'Asia/Tokyo')

    expect(utcHour).toMatch(/^(12|12\s?PM)$/)
    expect(tokyoHour).toMatch(/^(21|9\s?PM)$/)
    expect(utcHour).not.toBe(tokyoHour)
  })

  it('renders a clock time with minutes', () => {
    expect(formatClock(NOON_UTC, 'UTC')).toMatch(/^12:00(\s?PM)?$/)
    expect(formatClock(NOON_UTC, 'Asia/Yangon')).toMatch(/^(6:30|18:30)(\s?PM)?$/)
  })

  it('falls back to UTC for an invalid zone instead of throwing', () => {
    expect(formatClock(NOON_UTC, 'Not/AZone')).toMatch(/^12:00(\s?PM)?$/)
  })

  it('produces a stable date key for midnight boundaries', () => {
    expect(formatDateKey(NOON_UTC, 'UTC')).toBe('2026-10-24')
    // 2026-10-24T18:00Z is already 2026-10-25 in Tokyo (03:00).
    expect(formatDateKey(Date.UTC(2026, 9, 24, 18) / 1_000, 'Asia/Tokyo')).toBe('2026-10-25')
    expect(formatDateKey(NOON_UTC, 'Not/AZone')).toBe('2026-10-24')
  })
})
