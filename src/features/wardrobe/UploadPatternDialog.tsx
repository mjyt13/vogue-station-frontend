import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { Modal } from '../../shared/Modal'
import { useUploadPattern } from './api'

// Upload a pattern image (3-step: create → PUT bytes → confirm). On success the
// ['patterns'] query refetches and the new pattern appears in the picker. It's
// private to the owner until published for moderation.
export function UploadPatternDialog() {
  const upload = useUploadPattern()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!file) return
    setError(null)
    try {
      await upload.mutateAsync({ name: name.trim(), file })
      setOpen(false)
      setName('')
      setFile(null)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not upload the pattern'))
    }
  }

  return (
    <>
      <button
        type="button"
        className="wardrobe__add"
        onClick={() => {
          setError(null)
          setOpen(true)
        }}
      >
        + Pattern
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Upload pattern">
        <p className="dialog-desc">A seamless PNG, JPEG, or WebP tile works best.</p>
        {error && (
          <p className="dialog-error" role="alert">
            {error}
          </p>
        )}
        <label className="dialog-field">
          Name
          <input
            className="dialog-input"
            value={name}
            maxLength={50}
            autoFocus
            placeholder="e.g. Houndstooth"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="dialog-field">
          Image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="dialog-btn dialog-btn--primary"
            disabled={!name.trim() || !file || upload.isPending}
            onClick={submit}
          >
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </Modal>
    </>
  )
}
