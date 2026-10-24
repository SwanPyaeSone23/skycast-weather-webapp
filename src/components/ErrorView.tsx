import { motion, useReducedMotion } from 'framer-motion'
import type { UiError } from '../lib/uiError'
import { Icon } from './Icon'

interface ErrorViewProps {
  error: UiError
  onRetry: () => void
  onOpenSettings: () => void
}

export function ErrorView({ error, onRetry, onOpenSettings }: ErrorViewProps) {
  const reduceMotion = useReducedMotion()
  const keyProblem = error.kind === 'invalid-key'

  return (
    <motion.section
      className="card error-state"
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      aria-labelledby="error-title"
    >
      <span className="error-state__icon" aria-hidden="true">
        <Icon name="cloud-off" size={30} />
      </span>
      <p className="eyebrow">No forecast to show</p>
      <h2 className="error-state__title" id="error-title">
        {error.title}
      </h2>
      <p className="error-state__copy">{error.message}</p>

      <div className="error-state__actions">
        {keyProblem ? (
          <>
            <button type="button" className="btn btn--primary" onClick={onOpenSettings}>
              <Icon name="key" size={17} />
              Update API key
            </button>
            <button type="button" className="btn btn--ghost" onClick={onRetry}>
              Try again
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            <Icon name="refresh" size={17} />
            Try again
          </button>
        )}
      </div>

      <p className="error-state__hint">
        You can also search for a different place using the bar above.
      </p>
    </motion.section>
  )
}
