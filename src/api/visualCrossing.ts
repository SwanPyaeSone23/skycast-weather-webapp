import { WeatherApiError } from '../lib/errors'
import type { VcResponse } from '../lib/types'

export const API_BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'

const REQUEST_TIMEOUT_MS = 20_000
const DAY_MS = 24 * 60 * 60 * 1000

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Requests a five-day window (two days either side of today) so that a full
 * 24 hours of history and 24 hours of forecast are always available, even
 * around midnight or daylight-saving changes.
 */
export function buildWeatherUrl(location: string, apiKey: string, now: Date = new Date()): string {
  const start = isoDate(new Date(now.getTime() - 2 * DAY_MS))
  const end = isoDate(new Date(now.getTime() + 2 * DAY_MS))
  const url = new URL(
    `${API_BASE_URL}/${encodeURIComponent(location.trim())}/${start}/${end}`,
  )

  url.searchParams.set('unitGroup', 'metric')
  url.searchParams.set('include', 'hours,current')
  url.searchParams.set('key', apiKey)
  url.searchParams.set('contentType', 'json')

  return url.toString()
}

/** Maps a non-2xx response (or an unexpected empty payload) to a friendly error. */
export function weatherHttpError(status: number, body: string): WeatherApiError {
  const detail = body.replace(/\s+/g, ' ').trim().toLowerCase()

  if (status === 401 || status === 403 || detail.includes('api key')) {
    return new WeatherApiError(
      'invalid-key',
      'Visual Crossing rejected the API key. Update it in settings and try again.',
      status,
    )
  }

  if (status === 429) {
    return new WeatherApiError(
      'rate-limit',
      'The Visual Crossing request limit has been reached. Wait a little while and try again.',
      status,
    )
  }

  if (status === 400 || status === 404) {
    return new WeatherApiError(
      'not-found',
      "We couldn't find weather data for that place. Check the spelling or try a nearby city.",
      status,
    )
  }

  if (status >= 500) {
    return new WeatherApiError(
      'server',
      'Visual Crossing is having trouble right now. Please try again in a moment.',
      status,
    )
  }

  return new WeatherApiError(
    'unknown',
    'Something unexpected happened while loading the weather. Please try again.',
    status,
  )
}

export async function fetchWeather(
  location: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<VcResponse> {
  const controller = new AbortController()
  let timedOut = false

  const forwardAbort = () => controller.abort()
  signal?.addEventListener('abort', forwardAbort, { once: true })

  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(buildWeatherUrl(location, apiKey), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw weatherHttpError(response.status, body)
    }

    let payload: VcResponse
    try {
      payload = (await response.json()) as VcResponse
    } catch {
      throw new WeatherApiError(
        'unknown',
        'Visual Crossing returned a response we could not read. Please try again.',
      )
    }

    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.days)) {
      throw new WeatherApiError(
        'not-found',
        "We couldn't find weather data for that place. Check the spelling or try a nearby city.",
      )
    }

    return payload
  } catch (error) {
    if (timedOut) {
      throw new WeatherApiError(
        'timeout',
        'The weather service took too long to respond. Please try again.',
      )
    }
    if (signal?.aborted) throw error
    if (error instanceof WeatherApiError) throw error
    throw new WeatherApiError(
      'network',
      "We couldn't reach the weather service. Check your internet connection and try again.",
    )
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', forwardAbort)
  }
}
