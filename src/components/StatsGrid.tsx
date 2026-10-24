import { motion, useReducedMotion } from 'framer-motion'
import type { WeatherSnapshot } from '../lib/types'
import {
  compassDirection,
  formatPressure,
  formatPrecip,
  formatVisibility,
  formatWind,
  percentOrDash,
  uvDescription,
  type Unit,
} from '../lib/units'
import type { IconName } from './Icon'
import { Icon } from './Icon'

interface StatsGridProps {
  data: WeatherSnapshot
  unit: Unit
}

interface Stat {
  icon: IconName
  label: string
  value: string
  detail: string
}

export function StatsGrid({ data, unit }: StatsGridProps) {
  const reduceMotion = useReducedMotion()
  const { current } = data

  const windDetail = [
    compassDirection(current.windDirectionDeg),
    current.windGustKph !== null ? `gusts ${formatWind(current.windGustKph, unit)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const stats: Stat[] = [
    {
      icon: 'wind',
      label: 'Wind',
      value: formatWind(current.windKph, unit),
      detail: windDetail,
    },
    {
      icon: 'drop',
      label: 'Chance of rain',
      value: percentOrDash(current.precipProb),
      detail:
        current.precipMm !== null
          ? `${formatPrecip(current.precipMm, unit)} expected`
          : 'No precipitation reported',
    },
    {
      icon: 'humidity',
      label: 'Humidity',
      value: current.humidity !== null ? `${Math.round(current.humidity)}%` : '—',
      detail:
        current.cloudCover !== null
          ? `${Math.round(current.cloudCover)}% cloud cover`
          : 'Relative humidity',
    },
    {
      icon: 'sun',
      label: 'UV index',
      value: current.uvIndex !== null ? `${Math.round(current.uvIndex)}` : '—',
      detail: uvDescription(current.uvIndex),
    },
    {
      icon: 'gauge',
      label: 'Pressure',
      value: current.pressureHpa !== null ? formatPressure(current.pressureHpa, unit) : '—',
      detail: 'Sea level',
    },
    {
      icon: 'eye',
      label: 'Visibility',
      value: current.visibilityKm !== null ? formatVisibility(current.visibilityKm, unit) : '—',
      detail: 'Horizontal range',
    },
  ]

  return (
    <div className="stats" role="list" aria-label="Current weather details">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="card stat"
          role="listitem"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: 0.08 + index * 0.045,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="stat__icon" aria-hidden="true">
            <Icon name={stat.icon} size={17} />
          </span>
          <span className="stat__label">{stat.label}</span>
          <span className="stat__value">{stat.value}</span>
          <span className="stat__detail">{stat.detail}</span>
        </motion.div>
      ))}
    </div>
  )
}
