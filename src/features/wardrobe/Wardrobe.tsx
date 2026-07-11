import { AxisSlider } from '../../shared/controls'
import { SwatchPicker } from '../../shared/SwatchPicker'
import type { Swatch } from '../../shared/SwatchPicker'
import { PATTERN_SCALE } from './config'
import './Wardrobe.css'

export type WardrobeColor = { id: string; name: string; hex: string }
export type WardrobePattern = { id: string; name: string; thumbnailUrl?: string }

// The wardrobe: what a user can dress a garment in. Presentational — it renders
// the given catalog as pickers and reports the chosen color/pattern/scale. The
// create page holds the catalog (from the backend) and the selection state.
export function Wardrobe({
  colors,
  patterns,
  selectedColorId,
  selectedPatternId,
  patternScale,
  onColor,
  onPattern,
  onScale,
}: {
  colors: WardrobeColor[]
  patterns: WardrobePattern[]
  selectedColorId: string | null
  selectedPatternId: string | null
  patternScale: number
  onColor: (color: WardrobeColor) => void
  onPattern: (patternId: string | null) => void
  onScale: (scale: number) => void
}) {
  const colorSwatches: Swatch[] = colors.map((c) => ({ key: c.id, name: c.name, color: c.hex }))
  const patternSwatches: Swatch[] = [
    { key: '', name: 'None' },
    ...patterns.map((p) => ({ key: p.id, name: p.name, image: p.thumbnailUrl })),
  ]

  return (
    <div className="wardrobe">
      <SwatchPicker
        label="color"
        value={selectedColorId ?? ''}
        options={colorSwatches}
        onChange={(id) => {
          const color = colors.find((c) => c.id === id)
          if (color) onColor(color)
        }}
      />
      <SwatchPicker
        label="pattern"
        value={selectedPatternId ?? ''}
        options={patternSwatches}
        onChange={(id) => onPattern(id || null)}
      />
      {selectedPatternId && (
        <AxisSlider
          label="scale"
          value={patternScale}
          min={PATTERN_SCALE.min}
          max={PATTERN_SCALE.max}
          step={PATTERN_SCALE.step}
          onChange={onScale}
        />
      )}
    </div>
  )
}
