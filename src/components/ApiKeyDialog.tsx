import { useEffect, useRef } from 'react'
import { ApiKeyForm } from './ApiKeyForm'
import { Icon } from './Icon'

interface ApiKeyDialogProps {
  open: boolean
  onClose: () => void
  onSave: (key: string) => void
  onRemove: () => void
  hasStoredKey: boolean
  hasEnvKey: boolean
}

export function ApiKeyDialog({
  open,
  onClose,
  onSave,
  onRemove,
  hasStoredKey,
  hasEnvKey,
}: ApiKeyDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      document.body.classList.add('has-modal')
    } else if (!open && dialog.open) {
      dialog.close()
    }

    return () => {
      document.body.classList.remove('has-modal')
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby="key-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="modal__panel">
          <div className="modal__head">
            <div>
              <p className="eyebrow">Settings</p>
              <h2 className="modal__title" id="key-dialog-title">
                Weather API key
              </h2>
            </div>
            <button
              type="button"
              className="icon-btn icon-btn--small"
              onClick={onClose}
              aria-label="Close settings"
            >
              <Icon name="close" size={17} />
            </button>
          </div>

          <p className="modal__status">
            {hasStoredKey
              ? 'A key is saved in this browser. Paste a new one below to replace it.'
              : hasEnvKey
                ? "This build uses a key from its environment. You can override it for this browser below."
                : 'No key is configured.'}
          </p>

          <ApiKeyForm submitLabel="Save new key" onSubmit={onSave} onCancel={onClose} autoFocus />

          {hasStoredKey && (
            <button type="button" className="btn btn--danger" onClick={onRemove}>
              Remove saved key
            </button>
          )}

          <p className="fineprint">
            Keys are kept in <code>localStorage</code> and are only ever sent to Visual Crossing.
          </p>
        </div>
      )}
    </dialog>
  )
}
