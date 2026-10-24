import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildWeatherUrl, fetchWeather, weatherHttpError } from './visualCrossing'
import { WeatherApiError } from '../lib/errors'
import { makeResponse } from '../test/fixture'

const NOW = new Date(Date.UTC(2026, 9, 24, 12, 0, 0))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('buildWeatherUrl', () => {
  it('requests a five day window around today', () => {
    const url = new URL(buildWeatherUrl('London', 'test-key', NOW))

    expect(url.origin).toBe('https://weather.visualcrossing.com')
    expect(url.pathname).toBe(
      '/VisualCrossingWebServices/rest/services/timeline/London/2026-10-22/2026-10-26',
    )
    expect(url.searchParams.get('unitGroup')).toBe('metric')
    expect(url.searchParams.get('include')).toBe('hours,current')
    expect(url.searchParams.get('key')).toBe('test-key')
    expect(url.searchParams.get('contentType')).toBe('json')
  })

  it('encodes locations with spaces and punctuation safely', () => {
    const url = new URL(buildWeatherUrl('New York, NY', 'k', NOW))

    expect(url.pathname).toContain('/timeline/New%20York%2C%20NY/')
    expect(url.pathname).not.toContain(' ')
  })

  it('trims surrounding whitespace from the location', () => {
    const url = new URL(buildWeatherUrl('  Yangon  ', 'k', NOW))

    expect(url.pathname).toContain('/timeline/Yangon/')
  })

  it('defaults to the current date', () => {
    const url = new URL(buildWeatherUrl('Tokyo', 'k'))
    const today = new Date()

    const expectedStart = new Date(today.getTime() - 2 * 86_400_000).toISOString().slice(0, 10)
    const expectedEnd = new Date(today.getTime() + 2 * 86_400_000).toISOString().slice(0, 10)

    expect(url.pathname).toContain(`/${expectedStart}/${expectedEnd}`)
  })
})

describe('weatherHttpError', () => {
  it('maps authentication failures to invalid-key', () => {
    for (const status of [401, 403]) {
      const error = weatherHttpError(status, 'Bad API key')
      expect(error).toBeInstanceOf(WeatherApiError)
      expect(error.kind).toBe('invalid-key')
      expect(error.status).toBe(status)
    }
  })

  it('recognises key errors reported with another status', () => {
    expect(weatherHttpError(400, 'invalid api key supplied').kind).toBe('invalid-key')
  })

  it('maps rate limiting', () => {
    const error = weatherHttpError(429, 'Too many requests')

    expect(error.kind).toBe('rate-limit')
    expect(error.message).toMatch(/limit/i)
  })

  it('maps bad and missing locations to not-found', () => {
    expect(weatherHttpError(400, '').kind).toBe('not-found')
    expect(weatherHttpError(404, '').kind).toBe('not-found')
    expect(weatherHttpError(400, '').message).toMatch(/couldn't find/i)
  })

  it('maps upstream failures to server', () => {
    expect(weatherHttpError(500, '').kind).toBe('server')
    expect(weatherHttpError(503, '').kind).toBe('server')
  })

  it('falls back to unknown for unexpected statuses', () => {
    expect(weatherHttpError(418, "I'm a teapot").kind).toBe('unknown')
    expect(weatherHttpError(302, '').kind).toBe('unknown')
  })
})

describe('fetchWeather', () => {
  it('returns the parsed payload for a successful request', async () => {
    const payload = makeResponse()
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchWeather('Fixture City', 'test-key')

    expect(result.resolvedAddress).toBe('Fixture City, Testland')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [requestedUrl, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(requestedUrl).toContain('/timeline/Fixture%20City/')
    expect(init.headers).toEqual({ Accept: 'application/json' })
  })

  it('throws a mapped error for a non-2xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('Bad API key', { status: 401 })),
    )

    await expect(fetchWeather('London', 'bad')).rejects.toMatchObject({
      kind: 'invalid-key',
      status: 401,
    })
  })

  it('throws not-found when the payload has no days array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ resolvedAddress: 'Nowhere' }), { status: 200 })),
    )

    await expect(fetchWeather('Nowhere', 'key')).rejects.toMatchObject({ kind: 'not-found' })
  })

  it('throws a readable error when the body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<html>nope</html>', { status: 200 })),
    )

    await expect(fetchWeather('London', 'key')).rejects.toMatchObject({
      kind: 'unknown',
      message: expect.stringMatching(/could not read/i),
    })
  })

  it('maps network failures to a connection error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch')
      }),
    )

    await expect(fetchWeather('London', 'key')).rejects.toMatchObject({
      kind: 'network',
      message: expect.stringMatching(/internet connection/i),
    })
  })

  it('times out after 20 seconds', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )

    const request = fetchWeather('London', 'key')
    const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' })

    await vi.advanceTimersByTimeAsync(20_000)
    await assertion
  })

  it('stops immediately when the caller aborts', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )

    const controller = new AbortController()
    const request = fetchWeather('London', 'key', controller.signal)
    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
