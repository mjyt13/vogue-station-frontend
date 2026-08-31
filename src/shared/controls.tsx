import './controls.css'

// A single generic slider. It knows nothing about x/y/z or position/rotation —
// it just reports a number back through onChange. All 6 axis controls reuse it.
export const AxisSlider = (props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  precision?: number
  unit?: string
}) => {
  return (
    <label className="axis-slider">
      <span>
        {props.label} = {props.value.toFixed(props.precision ?? 2)}
        {props.unit ?? ''}
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  )
}
