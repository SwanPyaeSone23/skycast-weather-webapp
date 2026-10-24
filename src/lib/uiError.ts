import { WeatherApiError, type WeatherErrorKind } from './errors'

export interface UiError {
  kind: WeatherErrorKind | 'unknown'
  title: string
  message: string
}

const TITLES: Record<WeatherErrorKind, string> = {
  'invalid-key': 'API key needed',
  'not-found': 'Place not found',
  'rate-limit': 'Request limit reached',
  network: 'Connection problem',
  timeout: 'Request timed out',
  server: 'Weather service unavailable',
  'bad-request': 'Request failed',
  unknown: 'Something went wrong',
}

export function toUiError(error: unknown): UiError {
  if (error instanceof WeatherApiError) {
    return {
      kind: error.kind,
      title: TITLES[error.kind],
      message: error.message,
    }
  }

  if (error instanceof Error && error.message) {
    return { kind: 'unknown', title: TITLES.unknown, message: error.message }
  }

  return {
    kind: 'unknown',
    title: TITLES.unknown,
    message: 'Something unexpected happened. Please try again.',
  }
}
