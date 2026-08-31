import { useState } from 'react'
import { hexToHsl, hslToHex } from './color'
import { AxisSlider } from './controls'
import { ColorWheel } from './ColorWheel'
import './ColorPicker.css'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

// A hex field + HSL sliders, replacing the native <input type="color"> whose
// browser-drawn HSL UI digit-cuts typed hue values and caps lightness at 50%.
// Domain-agnostic like the rest of shared/: takes a hex string, reports one back.
export const ColorPicker = (props: { value: string; onChange: (hex: string) => void }) => {
  const [hexDraft, setHexDraft] = useState(props.value)
  // Mirrors props.value into hexDraft on external changes (e.g. a slider
  // drag) without clobbering an in-progress, not-yet-valid keystroke — the
  // render-time "adjust state" pattern instead of an effect, since resetting
  // in an effect would commit the stale draft for one extra frame first.
  const [syncedValue, setSyncedValue] = useState(props.value)
  if (props.value !== syncedValue) {
    setSyncedValue(props.value)
    setHexDraft(props.value)
  }

  const { h, s, l } = hexToHsl(props.value)

  const setHsl = (next: Partial<{ h: number; s: number; l: number }>) => {
    props.onChange(hslToHex(next.h ?? h, next.s ?? s, next.l ?? l))
  }

  return (
    <div className="color-picker">
      <div className="color-picker__top">
        <span className="color-picker__swatch" style={{ background: props.value }} />
        <input
          className="color-picker__hex dialog-input"
          value={hexDraft}
          maxLength={7}
          spellCheck={false}
          aria-label="Hex color"
          onChange={(e) => {
            const raw = e.target.value
            setHexDraft(raw)
            if (HEX_RE.test(raw)) props.onChange(raw)
          }}
          onBlur={() => setHexDraft(props.value)}
        />
      </div>
      <div className="color-picker__body">
        <ColorWheel hue={h} sat={s} onChange={({ h: nh, s: ns }) => setHsl({ h: nh, s: ns })} />
        <div className="color-picker__sliders">
          <AxisSlider
            label="Hue"
            value={h}
            min={0}
            max={360}
            step={1}
            precision={0}
            unit="°"
            onChange={(v) => setHsl({ h: v })}
          />
          <AxisSlider
            label="Sat"
            value={s}
            min={0}
            max={100}
            step={1}
            precision={0}
            unit="%"
            onChange={(v) => setHsl({ s: v })}
          />
          <AxisSlider
            label="Light"
            value={l}
            min={0}
            max={100}
            step={1}
            precision={0}
            unit="%"
            onChange={(v) => setHsl({ l: v })}
          />
        </div>
      </div>
    </div>
  )
}
