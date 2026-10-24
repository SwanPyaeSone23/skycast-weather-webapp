import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchWeather } from './api/visualCrossing'
import { ApiKeyDialog } from './components/ApiKeyDialog'
import { ApiKeyGate } from './components/ApiKeyGate'
import { CurrentCard } from './components/CurrentCard'
import { EmptyView } from './components/EmptyView'
import { ErrorBanner } from './components/ErrorBanner'
import { ErrorView } from './components/ErrorView'
import { Header } from './components/Header'
import { HourlyStrip } from './components/HourlyStrip'
import { Icon } from './components/Icon'
import { LoadingView } from './components/LoadingView'
import { StatsGrid } from './components/StatsGrid'
import { friendlyTimeZone } from './lib/format'
import { geolocationMessage, getBrowserCoordinates } from './lib/geolocation'
import { pickTheme } from './lib/theme'
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
} from './lib/storage'
import type { Unit } from './lib/units'
import { toUiError, type UiError } from './lib/uiError'
import { buildSnapshot } from './lib/weather'
import type { WeatherSnapshot } from './lib/types'

const DEFAULT_TITLE = 'Skycast — Live Weather Dashboard'

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => resolveApiKey())
  const [hasStoredKey, setHasStoredKey] = useState<boolean>(() => Boolean(getStoredApiKey()))
  const [unit, setUnit] = useState<Unit>(() => getUnit())
  const [query, setQuery] = useState('')
  const [data, setData] = useState<WeatherSnapshot | null>(null)
  const [error, setError] = useState<UiError | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const requestRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)
  const interactionRef = useRef(0)
  const activeLocationRef = useRef('')
  const lastRequestedRef = useRef('')
  const mountedRef = useRef(true)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const loadWeather = useCallback(async (location: string, key: string) => {
    const place = location.trim()
    if (!place || !key) return

    lastRequestedRef.current = place
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)

    try {
      const payload = await fetchWeather(place, key, controller.signal)
      if (requestId !== requestIdRef.current || !mountedRef.current) return

      const snapshot = buildSnapshot(payload)
      setData(snapshot)
      setNotice(null)
      activeLocationRef.current = place
      saveLastLocation(place)
      document.title = `${snapshot.location.split(',')[0]} · Skycast`
    } catch (caught) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      if (!mountedRef.current) return
      setError(toUiError(caught))
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  /**
   * Asks the browser for a location, then loads it.
   * `stillWanted` lets the initial bootstrap abandon its result if the user
   * has already searched for somewhere else in the meantime.
   */
  const locateAndLoad = useCallback(
    async (key: string, stillWanted?: () => boolean): Promise<boolean> => {
      setLocating(true)
      try {
        const coordinates = await getBrowserCoordinates()
        if (stillWanted && !stillWanted()) return false
        if (!mountedRef.current) return false

        setLocating(false)
        await loadWeather(
          formatCoordinates(coordinates.latitude, coordinates.longitude),
          key,
        )
        return true
      } catch (caught) {
        if (!stillWanted || stillWanted()) {
          setNotice(geolocationMessage(caught))
        }
        return false
      } finally {
        if (mountedRef.current) setLocating(false)
      }
    },
    [loadWeather],
  )

  const bootstrap = useCallback(
    async (key: string) => {
      const startedAt = interactionRef.current
      const stillWanted = () => interactionRef.current === startedAt

      const located = await locateAndLoad(key, stillWanted)
      if (!stillWanted() || !mountedRef.current) return

      if (!located) {
        const saved = getLastLocation()
        if (saved) {
          setNotice(null)
          await loadWeather(saved, key)
        }
      }
    },
    [loadWeather, locateAndLoad],
  )

  useEffect(() => {
    mountedRef.current = true
    const initialKey = resolveApiKey()
    if (initialKey) void bootstrap(initialKey)

    return () => {
      mountedRef.current = false
      requestRef.current?.abort()
    }
  }, [bootstrap])

  const runSearch = useCallback(
    (place: string) => {
      const value = place.trim()
      if (!value) {
        searchInputRef.current?.focus()
        return
      }
      interactionRef.current += 1
      setQuery(value)
      setNotice(null)
      if (!apiKey) {
        setSettingsOpen(true)
        return
      }
      void loadWeather(value, apiKey)
    },
    [apiKey, loadWeather],
  )

  const handleSearch = useCallback(() => {
    runSearch(query)
  }, [query, runSearch])

  const handleRefresh = useCallback(() => {
    const place = lastRequestedRef.current || activeLocationRef.current
    if (!place || !apiKey) return
    interactionRef.current += 1
    void loadWeather(place, apiKey)
  }, [apiKey, loadWeather])

  const handleLocate = useCallback(() => {
    if (!apiKey) {
      setSettingsOpen(true)
      return
    }
    interactionRef.current += 1
    setNotice(null)
    void locateAndLoad(apiKey)
  }, [apiKey, locateAndLoad])

  const handleUnitChange = useCallback((next: Unit) => {
    setUnit(next)
    saveUnit(next)
  }, [])

  const handleKeySaved = useCallback(
    (key: string) => {
      interactionRef.current += 1
      saveApiKey(key)
      setHasStoredKey(true)
      setApiKey(key)
      setSettingsOpen(false)
      setError(null)
      setNotice(null)

      const place = lastRequestedRef.current || activeLocationRef.current
      if (place) {
        void loadWeather(place, key)
      } else {
        void bootstrap(key)
      }
    },
    [bootstrap, loadWeather],
  )

  const handleKeyRemoved = useCallback(() => {
    interactionRef.current += 1
    clearApiKey()
    setHasStoredKey(false)
    setSettingsOpen(false)

    const nextKey = resolveApiKey()
    setApiKey(nextKey)

    if (!nextKey) {
      requestRef.current?.abort()
      requestIdRef.current += 1
      activeLocationRef.current = ''
      lastRequestedRef.current = ''
      setData(null)
      setError(null)
      setNotice(null)
      setLoading(false)
      setLocating(false)
      document.title = DEFAULT_TITLE
      return
    }

    const place = lastRequestedRef.current || activeLocationRef.current
    if (place) {
      void loadWeather(place, nextKey)
    } else {
      void bootstrap(nextKey)
    }
  }, [bootstrap, loadWeather])

  const theme = data ? pickTheme(data.current.icon) : 'clear-night'
  const initialLoading = !data && (loading || locating)
  const showError = !data && Boolean(error) && !loading && !locating
  const showEmpty = !data && !loading && !locating && !error

  const banner: UiError | null =
    error ??
    (notice
      ? { kind: 'unknown', title: 'Location unavailable', message: notice }
      : null)

  return (
    <div className="app" data-theme={theme}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="app__aura" aria-hidden="true" />

      {!apiKey ? (
        <ApiKeyGate onSave={handleKeySaved} />
      ) : (
        <div className="shell">
          <Header
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            unit={unit}
            onUnitChange={handleUnitChange}
            onLocate={handleLocate}
            onRefresh={handleRefresh}
            onOpenSettings={() => setSettingsOpen(true)}
            loading={loading}
            locating={locating}
            hasData={Boolean(data)}
            inputRef={searchInputRef}
          />

          <main className="main" id="main">
            {initialLoading && (
              <LoadingView
                message={
                  locating ? 'Finding your location…' : 'Reading the sky over your search…'
                }
              />
            )}

            {showError && error && (
              <ErrorView
                error={error}
                onRetry={handleRefresh}
                onOpenSettings={() => setSettingsOpen(true)}
              />
            )}

            {showEmpty && (
              <EmptyView
                notice={notice}
                locating={locating}
                onLocate={handleLocate}
                onSelectCity={runSearch}
              />
            )}

            {data && (
              <motion.div
                key={data.location}
                className="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatePresence initial={false}>
                  {banner && (
                    <ErrorBanner
                      key="banner"
                      error={banner}
                      onRetry={error ? handleRefresh : handleLocate}
                      onDismiss={() => (error ? setError(null) : setNotice(null))}
                      onOpenSettings={() => setSettingsOpen(true)}
                    />
                  )}
                </AnimatePresence>

                <div className="dashboard__top">
                  <CurrentCard data={data} unit={unit} />
                  <StatsGrid data={data} unit={unit} />
                </div>

                <HourlyStrip
                  id="past-hours"
                  variant="past"
                  title="Previous 24 hours"
                  subtitle="How the last day unfolded"
                  hours={data.past}
                  timezone={data.timezone}
                  unit={unit}
                  emptyMessage="Historical hourly data isn't available for this place yet. Future hours are still below."
                />

                <HourlyStrip
                  id="future-hours"
                  variant="future"
                  title="Next 24 hours"
                  subtitle="What the sky has in store"
                  hours={data.future}
                  timezone={data.timezone}
                  unit={unit}
                  emptyMessage="The hourly forecast isn't available right now. Try refreshing in a moment."
                />
              </motion.div>
            )}
          </main>

          <footer className="footer">
            <span className="footer__item">
              <span className="footer__dot" aria-hidden="true" />
              {data
                ? `Hours shown in ${friendlyTimeZone(data.timezone)}`
                : 'Weather, at a glance'}
            </span>
            <span className="footer__item">
              Data by{' '}
              <a
                href="https://www.visualcrossing.com/weather-api"
                target="_blank"
                rel="noreferrer noopener"
              >
                Visual Crossing
                <Icon name="external" size={12} />
              </a>
            </span>
          </footer>
        </div>
      )}

      <ApiKeyDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleKeySaved}
        onRemove={handleKeyRemoved}
        hasStoredKey={hasStoredKey}
        hasEnvKey={hasEnvironmentKey}
      />
    </div>
  )
}
