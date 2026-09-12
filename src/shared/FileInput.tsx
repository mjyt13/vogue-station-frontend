import { useId } from 'react'

// A styled stand-in for the native file-picker button, which browsers render
// with an un-themeable OS control. Keeps a real (visually hidden) <input
// type="file"> underneath for actual picking/accessibility — this only
// restyles the trigger and shows the chosen filename next to it.
export function FileInput({
  label,
  accept,
  value,
  onChange,
}: {
  label: string
  accept?: string
  value: File | null
  onChange: (file: File | null) => void
}) {
  const id = useId()

  return (
    <div className="file-input">
      <input
        id={id}
        className="file-input__native"
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <label htmlFor={id} className="file-input__trigger">
        {label}
      </label>
      <span className="file-input__name">{value ? value.name : 'No file selected'}</span>
    </div>
  )
}
