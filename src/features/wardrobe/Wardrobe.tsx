import { AxisSlider } from '../../shared/controls'
import { SwatchPicker } from '../../shared/SwatchPicker'
import type { Swatch } from '../../shared/SwatchPicker'
import type { GarmentMaterial } from '../viewer'
import { COLOR_PRESETS, PATTERN_PRESETS, PATTERN_SCALE } from './config'

// Catalog → picker options. Colors render a solid swatch; patterns render a
// tiled image (or the "none" slash for url === null).
const COLOR_SWATCHES: Swatch[] = COLOR_PRESETS.map((c) => ({
  key: c.value,
  name: c.name,
  color: c.value,
}))
const PATTERN_SWATCHES: Swatch[] = PATTERN_PRESETS.map((p) => ({
  key: p.url ?? '',
  name: p.name,
  image: p.url,
}))

// The wardrobe: what a user can dress a garment in. It owns the color/pattern
// catalog and the pickers, and reports the chosen surface as a GarmentMaterial
// patch. It renders no 3D — the viewer consumes the material it produces.
export function Wardrobe({
  material,
  onChange,
}: {
  material: GarmentMaterial
  onChange: (patch: Partial<GarmentMaterial>) => void
}) {
  return (
    <div id="wardrobe" className="toolbar">
      <SwatchPicker
        label="color"
        value={material.color}
        options={COLOR_SWATCHES}
        onChange={(color) => onChange({ color })}
      />
      <SwatchPicker
        label="pattern"
        value={material.patternUrl ?? ''}
        options={PATTERN_SWATCHES}
        onChange={(key) => onChange({ patternUrl: key || null })}
      />
      {material.patternUrl && (
        <AxisSlider
          label="scale"
          value={material.patternScale}
          min={PATTERN_SCALE.min}
          max={PATTERN_SCALE.max}
          step={PATTERN_SCALE.step}
          onChange={(patternScale) => onChange({ patternScale })}
        />
      )}
    </div>
  )
}
