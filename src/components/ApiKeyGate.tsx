import { ApiKeyForm } from './ApiKeyForm'
import { Icon } from './Icon'

interface ApiKeyGateProps {
  onSave: (key: string) => void
}

export function ApiKeyGate({ onSave }: ApiKeyGateProps) {
  return (
    <div className="gate">
      <div className="gate__brand">
        <span className="brand__mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="38" height="38">
            <defs>
              <linearGradient id="gate-sun" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffe29a" />
                <stop offset="1" stopColor="#ff9f45" />
              </linearGradient>
              <linearGradient id="gate-cloud" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7fbff" />
                <stop offset="1" stopColor="#bcd2e8" />
              </linearGradient>
            </defs>
            <circle cx="21" cy="11" r="6" fill="url(#gate-sun)" />
            <path
              d="M22.5 25H11.6a5 5 0 0 1-1-9.9 6.8 6.8 0 0 1 13-1.3A4.8 4.8 0 0 1 22.5 25Z"
              fill="url(#gate-cloud)"
            />
          </svg>
        </span>
        <span className="gate__brand-text">Skycast</span>
      </div>

      <section className="card gate__card" aria-labelledby="gate-title">
        <p className="eyebrow">
          <Icon name="key" size={14} />
          One quick step
        </p>
        <h1 className="gate__title" id="gate-title">
          Live weather needs a key.
        </h1>
        <p className="gate__copy">
          Skycast runs entirely in your browser and pulls its data from the Visual Crossing
          Timeline API. Add a free API key to see current conditions, the previous 24 hours and
          the next 24 hours for any place.
        </p>

        <ol className="steps">
          <li>
            <span className="steps__number">1</span>
            <span>
              <a
                className="text-link"
                href="https://www.visualcrossing.com/weather-api"
                target="_blank"
                rel="noreferrer noopener"
              >
                Create a free Visual Crossing account
                <Icon name="external" size={14} />
              </a>{' '}
              and copy the key from your account page.
            </span>
          </li>
          <li>
            <span className="steps__number">2</span>
            <span>Paste it below. It is saved only in this browser.</span>
          </li>
        </ol>

        <ApiKeyForm submitLabel="Save key & continue" onSubmit={onSave} autoFocus />

        <p className="fineprint">
          <Icon name="key" size={14} />
          Your key is stored in <code>localStorage</code> and sent only to Visual Crossing. It is
          never committed to this repository.
        </p>
        <p className="fineprint fineprint--muted">
          Building from source? You can also set <code>VITE_VISUAL_CROSSING_API_KEY</code> in a
          local <code>.env</code> file.
        </p>
      </section>

      <p className="gate__foot">Weather data by Visual Crossing</p>
    </div>
  )
}
