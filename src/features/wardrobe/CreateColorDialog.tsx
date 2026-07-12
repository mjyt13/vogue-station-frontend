import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { Modal } from '../../shared/Modal'
import { useCreateColor } from './api'

// Create a saved color. On success the ['colors'] query refetches and the new
// color appears in the picker.
export function CreateColorDialog() {
  const create = useCreateColor()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#3a6ed6')
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    try {
      await create.mutateAsync({ name: name.trim(), hex })
      setOpen(false)
      setName('')
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not create the color'))
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
        + Color
      </button>
      <Modal open={open} onOpenChange={setOpen} title="New color">
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
            placeholder="e.g. Sunset orange"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="dialog-field">
          Color
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} />
        </label>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="dialog-btn dialog-btn--primary"
            disabled={!name.trim() || create.isPending}
            onClick={submit}
          >
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </Modal>
    </>
  )
}
