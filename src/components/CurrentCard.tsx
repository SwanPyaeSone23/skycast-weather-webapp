import { motion, useReducedMotion } from 'framer-motion'
import type { WeatherSnapshot } from '../lib/types'
import { displayTemp, formatTemp, unitLabel, type Unit } from '../lib/units'
import { formatClock } from '../lib/format'
import { Icon } from './Icon'
import { WeatherIcon } from './WeatherIcon'

interface CurrentCardProps {
  data: WeatherSnapshot
  unit: Unit
}

export function CurrentCard({ data, unit }: CurrentCardProps) {
  const reduceMotion = useReducedMotion()
  const { current, today } = data
  const showSummary = data.description && data.description !== current.conditions
  const unitSuffix = unitLabel(unit).replace('°', '')

  return (
    <motion.section
      className="card hero"
      aria-labelledby="current-place"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__content">
        <h1 className="hero__place" id="current-place">
          <Icon name="pin" size={16} />
          <span>{data.location}</span>
        </h1>

        <div className="hero__temp">
          <span className="hero__number">{Math.round(displayTemp(current.tempC, unit))}</span>
          <span className="hero__degree" aria-hidden="true">
            °
          </span>
          <span className="hero__unit">{unitSuffix}</span>
        </div>

        <p className="hero__condition">{current.conditions}</p>

        <p className="hero__feels">
          Feels like {formatTemp(current.feelsLikeC, unit)}
          {today?.highC !== null && today?.highC !== undefined && (
            <>
              <span className="hero__sep" aria-hidden="true">
                ·
              </span>
              H {formatTemp(today.highC, unit)}
            </>
          )}
          {today?.lowC !== null && today?.lowC !== undefined && (
            <>
              <span className="hero__sep" aria-hidden="true">
                ·
              </span>
              L {formatTemp(today.lowC, unit)}
            </>
          )}
        </p>

        {showSummary && <p className="hero__summary">{data.description}</p>}
      </div>

      <div className="hero__art">
        <WeatherIcon icon={current.icon} size={216} animated className="hero__icon" />
      </div>

      <footer className="hero__footer">
        <span className="hero__meta">
          <Icon name="clock" size={15} />
          Updated {formatClock(current.epoch, data.timezone)}
        </span>
        {today?.sunrise && (
          <span className="hero__meta" title="Sunrise">
            <Icon name="sunrise" size={15} />
            {today.sunrise}
          </span>
        )}
        {today?.sunset && (
          <span className="hero__meta" title="Sunset">
            <Icon name="sunset" size={15} />
            {today.sunset}
          </span>
        )}
        <span className="hero__meta hero__meta--zone">{data.timezone.replace(/_/g, ' ')}</span>
      </footer>
    </motion.section>
  )
}
