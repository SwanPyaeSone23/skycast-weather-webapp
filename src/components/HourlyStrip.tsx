import { motion, useReducedMotion } from 'framer-motion'
import { formatDateKey, formatHour, formatWeekday } from '../lib/format'
import type { HourPoint } from '../lib/types'
import { formatTemp, type Unit } from '../lib/units'
import { Icon } from './Icon'
import { WeatherIcon } from './WeatherIcon'

interface HourlyStripProps {
  id: string
  title: string
  subtitle: string
  hours: HourPoint[]
  timezone: string
  unit: Unit
  variant: 'past' | 'future'
  emptyMessage: string
}

export function HourlyStrip({
  id,
  title,
  subtitle,
  hours,
  timezone,
  unit,
  variant,
  emptyMessage,
}: HourlyStripProps) {
  const reduceMotion = useReducedMotion()
  let previousDay = ''

  return (
    <motion.section
      className={`card hourly hourly--${variant}`}
      aria-labelledby={id}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: variant === 'past' ? 0.1 : 0.18 }}
    >
      <header className="hourly__head">
        <div>
          <h2 className="hourly__title" id={id}>
            {title}
          </h2>
          <p className="hourly__subtitle">{subtitle}</p>
        </div>
        <span className="hourly__count">
          {hours.length > 0 ? `${hours.length} hours` : 'No data'}
        </span>
      </header>

      {hours.length > 0 ? (
        <ol className="hourly__list" aria-label={title} tabIndex={0}>
          {hours.map((hour, index) => {
            const dayKey = formatDateKey(hour.epoch, timezone)
            const showDay = index === 0 || dayKey !== previousDay
            previousDay = dayKey

            const weekday = formatWeekday(hour.epoch, timezone)
            const time = formatHour(hour.epoch, timezone)
            const temperature = formatTemp(hour.tempC, unit)
            const rain =
              hour.precipProb !== null ? `${Math.round(hour.precipProb)}% chance of rain` : ''

            return (
              <motion.li
                key={`${variant}-${hour.epoch}`}
                className="hour-card"
                aria-label={`${showDay ? `${weekday}, ` : ''}${time}: ${hour.conditions}, ${temperature}${rain ? `, ${rain}` : ''}`}
                title={`${hour.conditions}${rain ? ` · ${rain}` : ''}`}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index, 10) * 0.025,
                  ease: 'easeOut',
                }}
              >
                <span className={`hour-card__day${showDay ? '' : ' is-empty'}`}>
                  {showDay ? weekday : '\u00A0'}
                </span>
                <span className="hour-card__time">{time}</span>
                <span className="hour-card__icon" aria-hidden="true">
                  <WeatherIcon icon={hour.icon} size={40} />
                </span>
                <span className="hour-card__temp">{temperature}</span>
                {hour.precipProb !== null ? (
                  <span className="hour-card__rain">
                    <Icon name="drop" size={11} />
                    {Math.round(hour.precipProb)}%
                  </span>
                ) : (
                  <span className="hour-card__rain is-empty" aria-hidden="true">
                    —
                  </span>
                )}
              </motion.li>
            )
          })}
        </ol>
      ) : (
        <p className="hourly__empty">{emptyMessage}</p>
      )}
    </motion.section>
  )
}
