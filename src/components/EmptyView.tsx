import { motion, useReducedMotion } from 'framer-motion'
import { Icon } from './Icon'
import { WeatherIcon } from './WeatherIcon'

const SUGGESTIONS = ['Yangon', 'London', 'New York', 'Tokyo', 'Sydney']

interface EmptyViewProps {
  notice: string | null
  locating: boolean
  onLocate: () => void
  onSelectCity: (city: string) => void
}

export function EmptyView({ notice, locating, onLocate, onSelectCity }: EmptyViewProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className="card empty"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="empty-title"
    >
      <div className="empty__art" aria-hidden="true">
        <WeatherIcon icon="partly-cloudy-day" size={132} animated />
      </div>

      <p className="eyebrow">Your sky, right now</p>
      <h2 className="empty__title" id="empty-title">
        Weather, wherever you are.
      </h2>
      <p className="empty__copy">
        Search for a city above, or let Skycast use your current location to show live
        conditions and the hours around now.
      </p>

      {notice && (
        <p className="notice" role="status">
          <Icon name="alert" size={17} />
          <span>{notice}</span>
        </p>
      )}

      <button type="button" className="btn btn--primary" onClick={onLocate} disabled={locating}>
        {locating ? <span className="spinner" aria-hidden="true" /> : <Icon name="locate" size={18} />}
        {locating ? 'Finding you…' : 'Use my current location'}
      </button>

      <div className="empty__suggestions">
        <span className="empty__suggestions-label">Try</span>
        {SUGGESTIONS.map((city) => (
          <button
            key={city}
            type="button"
            className="chip"
            onClick={() => onSelectCity(city)}
          >
            {city}
          </button>
        ))}
      </div>
    </motion.section>
  )
}
