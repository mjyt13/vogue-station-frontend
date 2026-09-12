import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { AuthPromptModal } from '../../shared/AuthPromptModal'
import { FileInput } from '../../shared/FileInput'
import { Modal } from '../../shared/Modal'
import { useAuth } from '../auth'
import { useUploadPattern } from './api'

// Below this, a pattern image is likely to look blurry/blocky once tiled
// across a garment at typical pattern scales.
const SMALL_FILE_WARNING_BYTES = 32 * 1024

function formatKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

// Upload a pattern image (3-step: create → PUT bytes → confirm). On success the
// ['patterns'] query refetches and the new pattern appears in the picker. It's
// private to the owner until published for moderation.
//
// The wardrobe is visible to anonymous visitors (same as the rest of
// /create), but uploading requires an account — send them to register
// instead of opening the dialog and letting a 401 leak into it.
export function UploadPatternDialog() {
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const upload = useUploadPattern()
  const [open, setOpen] = useState(false)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The file is already local, so preview it straight from the picked File —
  // no need to wait for the upload round-trip. Revoked whenever the file
  // changes (or the component unmounts) to avoid leaking blob URLs.
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

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

  const canSubmit = !!name.trim() && !!file && !upload.isPending
  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (canSubmit) submit()
  }

  return (
    <>
      <button
        type="button"
        className="wardrobe__add"
        onClick={() => {
          if (!authed) return setAuthPromptOpen(true)
          setError(null)
          setOpen(true)
        }}
      >
        + Pattern
      </button>
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        message="To upload a pattern, please register."
      />
      <Modal open={open} onOpenChange={setOpen} title="Upload pattern">
        <form className="dialog-form" onSubmit={onFormSubmit}>
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
            <FileInput
              label="Choose image"
              accept="image/png,image/jpeg,image/webp"
              value={file}
              onChange={setFile}
            />
          </label>
          {previewUrl && <img className="dialog-pattern-preview" src={previewUrl} alt="" />}
          {file && (
            <p className="dialog-hint">
              {formatKb(file.size)}
              {file.size < SMALL_FILE_WARNING_BYTES &&
                ' — this is a small file and may look blurry once tiled on a garment.'}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="dialog-btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="dialog-btn dialog-btn--primary" disabled={!canSubmit}>
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
