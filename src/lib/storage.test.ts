import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearApiKey,
  getLastLocation,
  getStoredApiKey,
  getUnit,
  hasEnvironmentKey,
  resolveApiKey,
  saveApiKey,
  saveLastLocation,
  saveUnit,
} from './storage'

function fakeStorage(): Storage {
  const data = new Map<string, string>()

  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => data.delete(key),
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: fakeStorage() })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API key storage', () => {
  it('starts empty when there is no environment key', () => {
    expect(hasEnvironmentKey).toBe(false)
    expect(getStoredApiKey()).toBe('')
    expect(resolveApiKey()).toBe('')
  })

  it('saves, resolves and removes a trimmed key', () => {
    saveApiKey('  abc123def456  ')

    expect(getStoredApiKey()).toBe('abc123def456')
    expect(resolveApiKey()).toBe('abc123def456')

    clearApiKey()
    expect(getStoredApiKey()).toBe('')
  })

  it('ignores placeholder values that were saved by mistake', () => {
    window.localStorage.setItem('skycast.apiKey', 'your_visual_crossing_api_key_here')

    expect(getStoredApiKey()).toBe('')
    expect(resolveApiKey()).toBe('')
  })
})

describe('unit preference', () => {
  it('defaults to Celsius', () => {
    expect(getUnit()).toBe('c')
  })

  it('remembers Fahrenheit and ignores invalid values', () => {
    saveUnit('f')
    expect(getUnit()).toBe('f')

    window.localStorage.setItem('skycast.unit', 'kelvin')
    expect(getUnit()).toBe('c')
  })
})

describe('last location', () => {
  it('is empty until a location is saved', () => {
    expect(getLastLocation()).toBe('')
  })

  it('round-trips a trimmed location', () => {
    saveLastLocation('  Yangon, Myanmar  ')
    expect(getLastLocation()).toBe('Yangon, Myanmar')
  })
})

describe('blocked storage', () => {
  it('fails soft when localStorage throws', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
        removeItem: () => {
          throw new Error('blocked')
        },
      },
    })

    expect(() => saveApiKey('key')).not.toThrow()
    expect(() => saveUnit('f')).not.toThrow()
    expect(() => saveLastLocation('London')).not.toThrow()
    expect(() => clearApiKey()).not.toThrow()
    expect(getStoredApiKey()).toBe('')
    expect(getUnit()).toBe('c')
    expect(getLastLocation()).toBe('')
  })
})
