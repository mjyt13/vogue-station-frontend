import { useState } from 'react'
import { Viewer } from '../viewer'
import type { GarmentMaterial } from '../viewer'
import { PATTERN_SCALE, useColors, usePatterns, Wardrobe } from '../wardrobe'
import { useModel, useModels, usePatternDetail } from './api'
import './create.css'

// The garment editor. Holds the backend catalog + the current selection, and
// assembles the render-ready GarmentMaterial the viewer needs. The wardrobe
// produces the selection; the viewer renders the material.
export function CreatePage() {
  const colors = useColors()
  const patterns = usePatterns()
  const models = useModels()
  const modelId = models.data?.[0]?.id
  const model = useModel(modelId)

  // Selection by id; the active color is derived (null → first catalog color),
  // so there's no state to sync when the catalog loads.
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null)
  const [patternScale, setPatternScale] = useState(PATTERN_SCALE.default)
  const patternDetail = usePatternDetail(selectedPatternId)

  if (models.isError || colors.isError || patterns.isError || model.isError) {
    return (
      <div className="create-status create-status--error">
        Couldn’t load the catalog. Try again.
      </div>
    )
  }

  const glbUrl = model.data?.glbUrl
  if (!glbUrl || !colors.data || !patterns.data) {
    return <div className="create-status">Loading your studio…</div>
  }

  const activeColor = colors.data.find((c) => c.id === selectedColorId) ?? colors.data[0]
  const material: GarmentMaterial = {
    color: activeColor?.hex ?? '#f5f5f5',
    patternUrl: selectedPatternId ? (patternDetail.data?.patternUrl ?? null) : null,
    patternScale,
  }

  return (
    <Viewer
      modelUrl={glbUrl}
      material={material}
      controls={
        <Wardrobe
          colors={colors.data.map((c) => ({ id: c.id, name: c.name, hex: c.hex }))}
          patterns={patterns.data.map((p) => ({
            id: p.id,
            name: p.name,
            thumbnailUrl: p.thumbnailUrl,
          }))}
          selectedColorId={activeColor?.id ?? null}
          selectedPatternId={selectedPatternId}
          patternScale={patternScale}
          onColor={(c) => setSelectedColorId(c.id)}
          onPattern={setSelectedPatternId}
          onScale={setPatternScale}
        />
      }
    />
  )
}
