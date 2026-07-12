import { Modal } from './Modal'

// One-button modal for surfacing a failed action. Render it with `message`
// null when there is nothing to show; the caller clears it on close.
export function ErrorDialog({
  title = 'Something went wrong',
  message,
  onClose,
}: {
  title?: string
  message: string | null
  onClose: () => void
}) {
  return (
    <Modal
      open={message !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={title}
    >
      <p className="dialog-desc" role="alert">
        {message}
      </p>
      <div className="dialog-actions">
        <button type="button" className="dialog-btn dialog-btn--primary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  )
}
