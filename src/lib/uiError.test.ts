import { describe, expect, it } from 'vitest'
import { WeatherApiError } from './errors'
import { toUiError } from './uiError'

describe('toUiError', () => {
  it('keeps the kind and message from a WeatherApiError', () => {
    const error = new WeatherApiError('rate-limit', 'Slow down a little.', 429)

    expect(toUiError(error)).toEqual({
      kind: 'rate-limit',
      title: 'Request limit reached',
      message: 'Slow down a little.',
    })
  })

  it('gives each kind a human title', () => {
    expect(toUiError(new WeatherApiError('invalid-key', 'x')).title).toBe('API key needed')
    expect(toUiError(new WeatherApiError('not-found', 'x')).title).toBe('Place not found')
    expect(toUiError(new WeatherApiError('network', 'x')).title).toBe('Connection problem')
    expect(toUiError(new WeatherApiError('timeout', 'x')).title).toBe('Request timed out')
    expect(toUiError(new WeatherApiError('server', 'x')).title).toBe('Weather service unavailable')
    expect(toUiError(new WeatherApiError('unknown', 'x')).title).toBe('Something went wrong')
  })

  it('turns a plain Error into an unknown error', () => {
    expect(toUiError(new Error('Boom'))).toEqual({
      kind: 'unknown',
      title: 'Something went wrong',
      message: 'Boom',
    })
  })

  it('has a fallback for non-Error values', () => {
    expect(toUiError('nope')).toEqual({
      kind: 'unknown',
      title: 'Something went wrong',
      message: 'Something unexpected happened. Please try again.',
    })
    expect(toUiError(new Error('')).message).toBe('Something unexpected happened. Please try again.')
  })
})
