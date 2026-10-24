export interface Coordinates {
  latitude: number
  longitude: number
}

/**
 * Wraps the callback-based Geolocation API.
 * Requests are deliberately low-accuracy: a city-level fix is all we need and
 * it responds faster (and with a shorter permission prompt) than GPS.
 */
export function getBrowserCoordinates(): Promise<Coordinates> {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return Promise.reject(new Error('Geolocation is not supported by this browser.'))
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60 * 1_000 },
    )
  })
}

export function geolocationMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: number }).code
      : undefined

  switch (code) {
    case 1:
      return 'Location access is blocked. You can allow it in your browser settings, or search for a city below.'
    case 2:
      return "Your location couldn't be determined right now. Search for a city below instead."
    case 3:
      return 'Finding your location took too long. Search for a city below instead.'
    default:
      return error instanceof Error
        ? `${error.message} Search for a city below instead.`
        : 'Your location is unavailable. Search for a city below instead.'
  }
}
