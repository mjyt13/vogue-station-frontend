import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import { AuthPromptModal } from '../../shared/AuthPromptModal'
import { ColorPicker } from '../../shared/ColorPicker'
import { Modal } from '../../shared/Modal'
import { useAuth } from '../auth'
import { useCreateColor } from './api'

// Create a saved color. On success the ['colors'] query refetches and the new
// color appears in the picker.
//
// The wardrobe is visible to anonymous visitors (same as the rest of
// /create), but creating anything requires an account — send them to
// register instead of opening the dialog and letting a 401 leak into it.
export function CreateColorDialog() {
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const create = useCreateColor()
  const [open, setOpen] = useState(false)
  const [authPromptOpen, setAuthPromptOpen] = useState(false)
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
          if (!authed) return setAuthPromptOpen(true)
          setError(null)
          setOpen(true)
        }}
      >
        + Color
      </button>
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        message="To create a color, please register."
      />
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
        <div className="dialog-field">
          <span>Color</span>
          <ColorPicker value={hex} onChange={setHex} />
        </div>
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
