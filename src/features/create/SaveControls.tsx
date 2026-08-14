import { useState } from 'react'
import type { MutableRefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../shared/api'
import type { CreateLookDto } from '../../shared/api'
import { Modal } from '../../shared/Modal'
import { useAuth } from '../auth'
import type { CaptureFn } from '../viewer'
import { useSaveLook, useUpdateLook, useUploadLookPreview } from './api'

const debugPreview = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug('[look-preview]', ...args)
}

// Save controls for the editor:
//  - editing an existing look → "Save" (update in place) + "Save as…" (new copy)
//  - a fresh look             → "Save look" (create)
// Creating always navigates to ?look=<newId> so further saves update it.
// The editor itself is open to anonymous visitors, so any save attempt while
// signed out sends them to registration instead of hitting the API.
export function SaveControls({
  lookId,
  lookName,
  payload,
  previewRef,
}: {
  lookId: string | null
  lookName?: string
  payload: Omit<CreateLookDto, 'name'>
  // Set by the Viewer once its Canvas is mounted; captures a static snapshot
  // of whatever's currently rendered (features/viewer/CapturePreview.tsx).
  previewRef: MutableRefObject<CaptureFn | null>
}) {
  const navigate = useNavigate()
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const save = useSaveLook()
  const update = useUpdateLook()
  const uploadPreview = useUploadLookPreview()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Best-effort: a snapshot is a nice-to-have for the gallery/cabinet card, not
  // something that should block or fail a save.
  const capturePreview = async (id: string) => {
    const capture = previewRef.current
    if (!capture) return
    try {
      const blob = await capture()
      debugPreview('captured', `${blob.size} bytes`, '→ uploading')
      await uploadPreview.mutateAsync({ id, blob })
      debugPreview('done', id)
    } catch (e) {
      debugPreview('failed', e)
    }
  }

  const create = async () => {
    setError(null)
    try {
      const look = await save.mutateAsync({ ...payload, name: name.trim() })
      await capturePreview(look.id)
      setOpen(false)
      setName('')
      navigate(`/create?look=${look.id}`, { replace: true })
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not save the look'))
    }
  }

  const saveInPlace = async () => {
    if (!authed) return navigate('/register')
    if (!lookId) return
    try {
      await update.mutateAsync({ id: lookId, body: { ...payload, name: lookName ?? 'Untitled' } })
      await capturePreview(lookId)
    } catch {
      // update's own error/pending state already reflects the failure
    }
  }

  const openSaveDialog = () => {
    if (!authed) return navigate('/register')
    setName('')
    setError(null)
    setOpen(true)
  }

  return (
    <div className="save-controls">
      {lookId && lookName && (
        <div className="save-controls__editing">
          Editing <strong>{lookName}</strong>
        </div>
      )}
      <div className="save-controls__buttons">
        {lookId && (
          <button
            type="button"
            className="save-controls__primary"
            onClick={saveInPlace}
            disabled={update.isPending}
          >
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
        )}
        <button
          type="button"
          className={lookId ? 'save-controls__secondary' : 'save-controls__primary'}
          onClick={openSaveDialog}
        >
          {lookId ? 'Save as…' : 'Save look'}
        </button>
      </div>

      <Modal open={open} onOpenChange={setOpen} title={lookId ? 'Save as a new look' : 'Save look'}>
        <p className="dialog-desc">Name this combination to find it in your cabinet.</p>
        {error && (
          <p className="dialog-error" role="alert">
            {error}
          </p>
        )}
        <input
          className="dialog-input"
          placeholder="e.g. Navy stripes tee"
          value={name}
          maxLength={60}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) create()
          }}
        />
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="dialog-btn dialog-btn--primary"
            disabled={!name.trim() || save.isPending}
            onClick={create}
          >
            {save.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
