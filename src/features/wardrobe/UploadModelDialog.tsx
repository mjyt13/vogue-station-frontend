import { useState } from 'react'
import { getApiErrorMessage } from '../../shared/api'
import type { GarmentKind } from '../../shared/api'
import { Modal } from '../../shared/Modal'
import { useUploadModel } from './api'

const KIND_OPTIONS: { value: GarmentKind; label: string }[] = [
  { value: 'TSHIRT', label: 'T-Shirt' },
  { value: 'SHIRT', label: 'Shirt' },
  { value: 'SKIRT', label: 'Skirt' },
  { value: 'PANTS', label: 'Pants' },
]

// Upload a garment model (create → PUT .glb → render + PUT a client-side
// thumbnail → confirm). It's private to the owner until published for
// moderation, same as patterns.
export function UploadModelDialog() {
  const upload = useUploadModel()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<GarmentKind>('TSHIRT')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!file) return
    setError(null)
    try {
      await upload.mutateAsync({ name: name.trim(), kind, file })
      setOpen(false)
      setName('')
      setFile(null)
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not upload the model'))
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
        + Model
      </button>
      <Modal open={open} onOpenChange={setOpen} title="Upload garment model">
        <p className="dialog-desc">A .glb file. A preview render is generated automatically.</p>
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
            placeholder="e.g. My Custom Tee"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="dialog-field">
          Garment type
          <select
            className="dialog-input"
            value={kind}
            onChange={(e) => setKind(e.target.value as GarmentKind)}
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="dialog-field">
          Model file
          <input
            type="file"
            accept=".glb,model/gltf-binary"
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
