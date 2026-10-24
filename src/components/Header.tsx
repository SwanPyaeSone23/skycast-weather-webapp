import type { RefObject } from 'react'
import type { Unit } from '../lib/units'
import { Icon } from './Icon'
import { SearchBar } from './SearchBar'
import { UnitToggle } from './UnitToggle'

interface HeaderProps {
  query: string
  onQueryChange: (value: string) => void
  onSearch: () => void
  unit: Unit
  onUnitChange: (unit: Unit) => void
  onLocate: () => void
  onRefresh: () => void
  onOpenSettings: () => void
  loading: boolean
  locating: boolean
  hasData: boolean
  inputRef: RefObject<HTMLInputElement | null>
}

export function Header({
  query,
  onQueryChange,
  onSearch,
  unit,
  onUnitChange,
  onLocate,
  onRefresh,
  onOpenSettings,
  loading,
  locating,
  hasData,
  inputRef,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="brand">
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="34" height="34">
            <defs>
              <linearGradient id="brand-sun" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe29a" />
                <stop offset="1" stopColor="#ff9f45" />
              </linearGradient>
              <linearGradient id="brand-cloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7fbff" />
                <stop offset="1" stopColor="#bcd2e8" />
              </linearGradient>
            </defs>
            <circle cx="21" cy="11" r="6" fill="url(#brand-sun)" />
            <path
              d="M22.5 25H11.6a5 5 0 0 1-1-9.9 6.8 6.8 0 0 1 13-1.3A4.8 4.8 0 0 1 22.5 25Z"
              fill="url(#brand-cloud)"
            />
          </svg>
        </span>
        <span className="brand__text">
          Skycast
          <span className="brand__tag">live weather</span>
        </span>
      </div>

      <SearchBar
        value={query}
        onChange={onQueryChange}
        onSubmit={onSearch}
        busy={loading || locating}
        inputRef={inputRef}
      />

      <div className="header__actions">
        <UnitToggle unit={unit} onChange={onUnitChange} />
        <button
          type="button"
          className="icon-btn"
          onClick={onLocate}
          disabled={locating}
          aria-label="Use my current location"
          title="Use my current location"
        >
          <Icon name="locate" size={19} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onRefresh}
          disabled={loading || !hasData}
          aria-label="Refresh weather"
          title="Refresh weather"
        >
          <Icon name="refresh" size={19} className={loading ? 'spin' : undefined} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Weather API settings"
          title="Weather API key"
        >
          <Icon name="key" size={19} />
        </button>
      </div>
    </header>
  )
}
