// A generic on/off switch. Domain-agnostic: it just reports a boolean through
// onChange. A styled checkbox, so it stays keyboard-accessible for free.
export const Toggle = (props: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) => {
  return (
    <label className="toggle">
      <input
        type="checkbox"
        className="toggle__input"
        checked={props.checked}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb" />
      </span>
      {props.label}
    </label>
  )
}
