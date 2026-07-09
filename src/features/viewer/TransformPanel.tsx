import { AxisSlider } from '../../shared/controls'
import { AXES, GROUPS } from './config'
import type { Axis, Kind, Transform } from './types'
import './TransformPanel.css'

// Renders every position/rotation slider from GROUPS × AXES. One onChange
// carries (kind, axis, value) so a single handler upstream covers all 6 actions.
export function TransformPanel({
  transform,
  onChange,
}: {
  transform: Transform
  onChange: (kind: Kind, axis: Axis, value: number) => void
}) {
  return (
    <div className="transform-panel">
      {GROUPS.map(({ kind, min, max, step }) => (
        <fieldset key={kind}>
          <legend>{kind}</legend>
          {AXES.map((axis) => (
            <AxisSlider
              key={axis}
              label={axis}
              value={transform[kind][axis]}
              min={min}
              max={max}
              step={step}
              onChange={(value) => onChange(kind, axis, value)}
            />
          ))}
        </fieldset>
      ))}
    </div>
  )
}
