import { AxisSlider } from '../../shared/controls'
import { SwatchPicker } from '../../shared/SwatchPicker'
import type { Swatch } from '../../shared/SwatchPicker'
import { PATTERN_SCALE } from './config'
import { CreateColorDialog } from './CreateColorDialog'
import { UploadModelDialog } from './UploadModelDialog'
import { UploadPatternDialog } from './UploadPatternDialog'
import './Wardrobe.css'

export type WardrobeColor = { id: string; name: string; hex: string }
export type WardrobePattern = { id: string; name: string; thumbnailUrl?: string }
export type WardrobeModel = { id: string; name: string; thumbnailUrl?: string }

// The wardrobe: what a user can dress a garment in. Presentational — it renders
// the given catalog as pickers and reports the chosen color/pattern/scale/model.
// The create page holds the catalog (from the backend) and the selection state.
export function Wardrobe({
  colors,
  patterns,
  models,
  selectedColorId,
  selectedPatternId,
  selectedModelId,
  patternScale,
  onColor,
  onPattern,
  onModel,
  onScale,
}: {
  colors: WardrobeColor[]
  patterns: WardrobePattern[]
  models: WardrobeModel[]
  selectedColorId: string | null
  selectedPatternId: string | null
  selectedModelId: string | null
  patternScale: number
  onColor: (color: WardrobeColor) => void
  onPattern: (patternId: string | null) => void
  onModel: (modelId: string) => void
  onScale: (scale: number) => void
}) {
  const colorSwatches: Swatch[] = colors.map((c) => ({ key: c.id, name: c.name, color: c.hex }))
  const patternSwatches: Swatch[] = [
    { key: '', name: 'None' },
    ...patterns.map((p) => ({ key: p.id, name: p.name, image: p.thumbnailUrl })),
  ]
  const modelSwatches: Swatch[] = models.map((m) => ({
    key: m.id,
    name: m.name,
    image: m.thumbnailUrl,
  }))

  return (
    <div className="wardrobe">
      <div className="wardrobe__row">
        <SwatchPicker
          label="model"
          value={selectedModelId ?? ''}
          options={modelSwatches}
          onChange={onModel}
        />
        <UploadModelDialog />
      </div>
      <div className="wardrobe__row">
        <SwatchPicker
          label="color"
          value={selectedColorId ?? ''}
          options={colorSwatches}
          onChange={(id) => {
            const color = colors.find((c) => c.id === id)
            if (color) onColor(color)
          }}
        />
        <CreateColorDialog />
      </div>
      <div className="wardrobe__row">
        <SwatchPicker
          label="pattern"
          value={selectedPatternId ?? ''}
          options={patternSwatches}
          onChange={(id) => onPattern(id || null)}
        />
        <UploadPatternDialog />
      </div>
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
