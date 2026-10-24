import type { Unit } from '../lib/units'

interface UnitToggleProps {
  unit: Unit
  onChange: (unit: Unit) => void
}

export function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div className="unit-toggle" role="group" aria-label="Temperature units">
      <button
        type="button"
        aria-pressed={unit === 'c'}
        onClick={() => onChange('c')}
        title="Celsius"
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={unit === 'f'}
        onClick={() => onChange('f')}
        title="Fahrenheit"
      >
        °F
      </button>
    </div>
  )
}
