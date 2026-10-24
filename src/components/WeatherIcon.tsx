import { useId, type ReactNode } from 'react'
import { isNightIcon, weatherKind } from '../lib/theme'

interface WeatherIconProps {
  icon: string
  size?: number
  animated?: boolean
  className?: string
}

function cx(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Hand-drawn SVG weather illustrations.
 * Icons are decorative: the condition is always announced in text next to them.
 */
export function WeatherIcon({ icon, size = 72, animated = false, className }: WeatherIconProps) {
  const rawId = useId()
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '')
  const kind = weatherKind(icon)
  const night = isNightIcon(icon)
  const partly = icon.toLowerCase().includes('partly')

  const sunId = `${id}-sun`
  const moonId = `${id}-moon`
  const cloudId = `${id}-cloud`
  const darkCloudId = `${id}-dark-cloud`
  const boltId = `${id}-bolt`

  const sun = (radius = 12) => (
    <g className="wi__sun">
      <g className="wi__rays">
        {Array.from({ length: 8 }, (_, index) => (
          <line
            key={index}
            x1="32"
            y1={32 - radius - 9}
            x2="32"
            y2={32 - radius - 3.5}
            transform={`rotate(${index * 45} 32 32)`}
            stroke={`url(#${sunId})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx="32" cy="32" r={radius} fill={`url(#${sunId})`} />
      <circle
        cx="32"
        cy="32"
        r={radius}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.22"
        strokeWidth="1"
      />
    </g>
  )

  const moon = (scale = 1) => (
    <g transform={`translate(${32 - 32 * scale} ${32 - 32 * scale}) scale(${scale})`}>
      <g transform="translate(4 4) scale(2)">
        <path
          d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
          fill={`url(#${moonId})`}
        />
      </g>
      <circle className="wi__star" cx="47" cy="16" r="1.5" fill="#fff" />
      <circle className="wi__star wi__star--late" cx="52" cy="27" r="1" fill="#fff" />
      <circle className="wi__star" cx="17" cy="15" r="1.1" fill="#fff" />
    </g>
  )

  const cloud = (fill: string, transform = '') => (
    <g transform={transform} className="wi__cloud">
      <path
        d="M41.5 43H22a8 8 0 0 1-1.3-15.9 12 12 0 0 1 23-3.5A9.5 9.5 0 0 1 41.5 43Z"
        fill={fill}
      />
      <path
        d="M24 34.5c2.6-2.2 6.1-2.4 8.9-.6"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.28"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  )

  const drops = (
    <g stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round">
      {[24, 32, 40].map((x, index) => (
        <line
          key={x}
          className="wi__drop"
          x1={x + 1}
          y1="45"
          x2={x - 2}
          y2="53"
          style={{ animationDelay: `${index * 0.22}s` }}
        />
      ))}
    </g>
  )

  const flakes = (
    <g stroke="#e0f2fe" strokeWidth="1.9" strokeLinecap="round">
      {[
        { x: 24, y: 49 },
        { x: 32, y: 52 },
        { x: 40, y: 49 },
      ].map(({ x, y }, index) => (
        <g
          key={x}
          className="wi__flake"
          style={{ animationDelay: `${index * 0.3}s` }}
          transform={`translate(${x} ${y})`}
        >
          <path d="M0 -4V4M-3.5 -2 3.5 2M3.5 -2-3.5 2" />
        </g>
      ))}
    </g>
  )

  let illustration: ReactNode

  switch (kind) {
    case 'clear':
      illustration = night ? moon() : sun()
      break
    case 'rain':
      illustration = (
        <>
          {partly && (
            <g transform="translate(10 -9)">{night ? moon(0.5) : sun(7)}</g>
          )}
          {cloud(`url(#${cloudId})`)}
          {drops}
        </>
      )
      break
    case 'storm':
      illustration = (
        <>
          {cloud(`url(#${darkCloudId})`)}
          <path
            d="M33 38 24 52h6.5L28 62l11-15h-6l3-9Z"
            fill={`url(#${boltId})`}
          />
        </>
      )
      break
    case 'snow':
      illustration = (
        <>
          {cloud(`url(#${cloudId})`, 'translate(0 -2)')}
          {flakes}
        </>
      )
      break
    case 'fog':
      illustration = (
        <>
          {cloud(`url(#${cloudId})`, 'translate(0 -4) scale(0.96)')}
          <g stroke="#dbeafe" strokeWidth="2.6" strokeLinecap="round" opacity="0.8">
            <line x1="18" y1="48" x2="44" y2="48" />
            <line x1="23" y1="55" x2="49" y2="55" />
          </g>
        </>
      )
      break
    case 'wind':
      illustration = (
        <g
          fill="none"
          stroke="#dbeafe"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="wi__gust"
        >
          <path d="M12 23h21a5 5 0 1 0-4.5-7.2" />
          <path d="M9 33h29a5 5 0 1 1-4.5 7.2" />
          <path d="M17 43h14" />
        </g>
      )
      break
    default:
      illustration = partly ? (
        <>
          <g transform="translate(10 -9)">{night ? moon(0.5) : sun(7)}</g>
          {cloud(`url(#${cloudId})`, 'translate(-1 6) scale(0.94)')}
        </>
      ) : (
        <>
          {cloud(`url(#${cloudId})`, 'translate(8 6) scale(0.55)')}
          {cloud(`url(#${cloudId})`, 'translate(-2 3)')}
        </>
      )
  }

  return (
    <svg
      className={cx('wi', `wi--${kind}`, night && 'wi--night', animated && 'wi--animated', className)}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={sunId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe7a3" />
          <stop offset="1" stopColor="#ff9a4d" />
        </linearGradient>
        <linearGradient id={moonId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8faff" />
          <stop offset="1" stopColor="#aebfe4" />
        </linearGradient>
        <linearGradient id={cloudId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6faff" />
          <stop offset="1" stopColor="#b6c9df" />
        </linearGradient>
        <linearGradient id={darkCloudId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d7e2f1" />
          <stop offset="1" stopColor="#8497af" />
        </linearGradient>
        <linearGradient id={boltId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b3" />
          <stop offset="1" stopColor="#f9c74f" />
        </linearGradient>
      </defs>
      {illustration}
    </svg>
  )
}
