import type { ReactNode } from 'react'

const ICON_PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7.25" />
      <path d="M16.5 16.5 21 21" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10.5c0 5.5-8 11.5-8 11.5S4 16 4 10.5a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10.5" r="2.8" />
    </>
  ),
  wind: (
    <>
      <path d="M3 8h10.5a2.75 2.75 0 1 0-2.6-3.7" />
      <path d="M3 12.5h14a2.75 2.75 0 1 1-2.6 3.7" />
      <path d="M3 17h7.5" />
    </>
  ),
  drop: <path d="M12 3.5S6 10 6 14a6 6 0 0 0 12 0c0-4-6-10.5-6-10.5Z" />,
  humidity: (
    <>
      <path d="M12 3.5S7 9.2 7 13a5 5 0 0 0 10 0c0-3.8-5-9.5-5-9.5Z" />
      <path d="M10 13.5a2 2 0 0 0 2 2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="15" r="1.4" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M4 4l16 16" />
      <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.5 7.6A16.7 16.7 0 0 0 2.5 12S6 18.5 12 18.5a9.8 9.8 0 0 0 3.3-.6" />
      <path d="M10.2 10.2a2.6 2.6 0 0 0 3.6 3.6" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 11.5A8 8 0 0 0 6 6.4L3.5 9" />
      <path d="M3.5 4.5V9H8" />
      <path d="M4 12.5A8 8 0 0 0 18 17.6l2.5-2.6" />
      <path d="M20.5 19.5V15H16" />
    </>
  ),
  locate: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15.5" r="3.5" />
      <path d="m10.5 13 8-8" />
      <path d="m16 7.5 2 2" />
      <path d="m18.5 5 2 2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  sunrise: (
    <>
      <path d="M3 18h18" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M12 3v4M5.3 7.3l1.8 1.8M18.7 7.3l-1.8 1.8" />
    </>
  ),
  sunset: (
    <>
      <path d="M3 18h18" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M12 10V6M5.3 12.7l1.8-1.8M18.7 12.7l-1.8-1.8" />
    </>
  ),
  'cloud-off': (
    <>
      <path d="M4 4l16 16" />
      <path d="M8.5 6.2A6 6 0 0 1 18 8.5a4 4 0 0 1 2.4 7.1" />
      <path d="M16.5 19H7a4.5 4.5 0 0 1-1.2-8.8" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.6 4.4L9 15l1.6-4.4L15 9Z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICON_PATHS

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function Icon({ name, size = 20, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  )
}
