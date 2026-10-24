import { motion, useReducedMotion } from 'framer-motion'
import type { UiError } from '../lib/uiError'
import { Icon } from './Icon'

interface ErrorBannerProps {
  error: UiError
  onRetry: () => void
  onDismiss: () => void
  onOpenSettings: () => void
}

export function ErrorBanner({ error, onRetry, onDismiss, onOpenSettings }: ErrorBannerProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="banner"
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <Icon name="alert" size={18} className="banner__icon" />
      <div className="banner__body">
        <strong>{error.title}</strong>
        <span>{error.message}</span>
      </div>
      <div className="banner__actions">
        {error.kind === 'invalid-key' && (
          <button type="button" className="banner__button" onClick={onOpenSettings}>
            Update key
          </button>
        )}
        <button type="button" className="banner__button" onClick={onRetry}>
          Retry
        </button>
        <button
          type="button"
          className="banner__close"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          <Icon name="close" size={15} />
        </button>
      </div>
    </motion.div>
  )
}
