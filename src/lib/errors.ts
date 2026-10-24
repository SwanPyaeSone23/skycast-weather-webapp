/** Errors thrown by the weather API client, with a machine-readable reason. */

export type WeatherErrorKind =
  | 'invalid-key'
  | 'not-found'
  | 'rate-limit'
  | 'network'
  | 'timeout'
  | 'server'
  | 'bad-request'
  | 'unknown'

export class WeatherApiError extends Error {
  readonly kind: WeatherErrorKind
  readonly status?: number

  constructor(kind: WeatherErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'WeatherApiError'
    this.kind = kind
    this.status = status
  }
}
