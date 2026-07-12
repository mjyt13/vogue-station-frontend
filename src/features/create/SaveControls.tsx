import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../shared/api'
import type { CreateLookDto } from '../../shared/api'
import { Modal } from '../../shared/Modal'
import { useSaveLook, useUpdateLook } from './api'

// Save controls for the editor:
//  - editing an existing look → "Save" (update in place) + "Save as…" (new copy)
//  - a fresh look             → "Save look" (create)
// Creating always navigates to ?look=<newId> so further saves update it.
export function SaveControls({
  lookId,
  lookName,
  payload,
}: {
  lookId: string | null
  lookName?: string
  payload: Omit<CreateLookDto, 'name'>
}) {
  const navigate = useNavigate()
  const save = useSaveLook()
  const update = useUpdateLook()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setError(null)
    try {
      const look = await save.mutateAsync({ ...payload, name: name.trim() })
      setOpen(false)
      setName('')
      navigate(`/create?look=${look.id}`, { replace: true })
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not save the look'))
    }
  }

  const saveInPlace = () => {
    if (lookId) update.mutate({ id: lookId, body: { ...payload, name: lookName ?? 'Untitled' } })
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
          onClick={() => {
            setName('')
            setError(null)
            setOpen(true)
          }}
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
