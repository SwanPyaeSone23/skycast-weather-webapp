import type { RefObject } from 'react'
import { Icon } from './Icon'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  busy?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
}

export function SearchBar({ value, onChange, onSubmit, busy = false, inputRef }: SearchBarProps) {
  const canSubmit = value.trim().length > 0 && !busy

  return (
    <form
      className="search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        if (canSubmit) onSubmit()
      }}
    >
      <label className="sr-only" htmlFor="place-search">
        Search for a city, ZIP code or place
      </label>
      <Icon name="search" className="search__icon" size={19} />
      <input
        id="place-search"
        ref={inputRef}
        type="search"
        className="search__input"
        placeholder="Search city, ZIP code, or place"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        enterKeyHint="search"
        aria-describedby="search-hint"
      />
      <span id="search-hint" className="sr-only">
        Press Enter to load the weather for the place you type.
      </span>
      {value.length > 0 && (
        <button
          type="button"
          className="search__clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <Icon name="close" size={14} />
        </button>
      )}
      <button
        type="submit"
        className="search__submit"
        aria-label="Search"
        disabled={!canSubmit}
      >
        <Icon name="arrow" size={18} />
      </button>
    </form>
  )
}
