import { useId, useState, type FormEvent } from 'react'
import { Icon } from './Icon'

interface ApiKeyFormProps {
  submitLabel: string
  onSubmit: (key: string) => void
  onCancel?: () => void
  autoFocus?: boolean
}

export function ApiKeyForm({ submitLabel, onSubmit, onCancel, autoFocus = false }: ApiKeyFormProps) {
  const [value, setValue] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const inputId = useId()
  const errorId = `${inputId}-error`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const key = value.trim()

    if (key.length < 8) {
      setError('That key looks too short. Paste the full key from your Visual Crossing account.')
      return
    }

    setError('')
    onSubmit(key)
  }

  return (
    <form className="key-form" onSubmit={handleSubmit} noValidate>
      <div className="key-form__label-row">
        <label className="key-form__label" htmlFor={inputId}>
          Visual Crossing API key
        </label>
        <a
          className="key-form__link"
          href="https://www.visualcrossing.com/weather-api"
          target="_blank"
          rel="noreferrer noopener"
        >
          Get a free key
          <Icon name="external" size={13} />
        </a>
      </div>

      <div className={`field${error ? ' field--invalid' : ''}`}>
        <Icon name="key" size={17} className="field__icon" />
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            if (error) setError('')
          }}
          placeholder="Paste your API key"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="field__reveal"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide API key' : 'Show API key'}
          title={visible ? 'Hide API key' : 'Show API key'}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={17} />
        </button>
      </div>

      {error && (
        <p className="field__error" id={errorId} role="alert">
          {error}
        </p>
      )}

      <div className="key-form__actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
