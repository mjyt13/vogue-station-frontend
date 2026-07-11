import './SwatchPicker.css'

// A generic swatch dropdown. It knows nothing about garments — it takes a list
// of options and reports the chosen value's key through onChange. Each option
// renders a swatch: a solid `color`, a tiled `image`, or neither (a "none"
// slash). Opens on hover or keyboard focus (CSS :focus-within), so it needs no
// open/close state. Used for both color and pattern pickers.
export type Swatch = { key: string; name: string; color?: string; image?: string | null }


export const SwatchPicker = (props: {
  label: string
  value: string
  options: Swatch[]
  onChange: (key: string) => void
}) => {
  const current = props.options.find((o) => o.key === props.value)
  return (
    <div className="swatch-picker">
      <button type="button" className="swatch-picker__trigger" aria-haspopup="true">
        <Dot swatch={current} />
        {props.label}: {current?.name ?? props.value}
      </button>
      <ul className="swatch-picker__menu" role="listbox" aria-label={props.label}>
        {props.options.map((opt) => (
          <li key={opt.key}>
            <button
              type="button"
              role="option"
              aria-selected={opt.key === props.value}
              title={opt.name}
              className="swatch-picker__option"
              onClick={() => props.onChange(opt.key)}
            >
              <Dot swatch={opt} />
              {opt.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const Dot = ({ swatch }: { swatch?: Swatch }) => {
  // Image swatches use <img crossorigin> (a CORS request) rather than a CSS
  // background: presigned MinIO images are cross-origin, and a no-cors CSS
  // background gets blocked by the browser's Opaque Response Blocking (ORB).
  if (swatch?.image) {
    return (
      <img className="swatch-picker__swatch" src={swatch.image} alt="" crossOrigin="anonymous" />
    )
  }
  const none = swatch && !swatch.color && !swatch.image
  return (
    <span
      className={`swatch-picker__swatch${none ? ' swatch-picker__swatch--none' : ''}`}
      style={swatch?.color ? { background: swatch.color } : undefined}
    />
  )
}
