import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Viewer } from '../viewer'
import type { GarmentMaterial } from '../viewer'
import { PATTERN_SCALE, useColors, usePatterns, Wardrobe } from '../wardrobe'
import { useLook, useModel, useModels, usePatternDetail } from './api'
import { SaveControls } from './SaveControls'
import './create.css'

type EditorInitial = {
  modelId?: string
  colorId: string | null
  patternId: string | null
  patternScale: number
  name?: string
}

// Route shell: opens a saved look when `?look=<id>` is present, otherwise a
// fresh editor. The `key` remounts the Editor so its state re-seeds from `initial`.
export function CreatePage() {
  const [params] = useSearchParams()
  const lookId = params.get('look')
  const look = useLook(lookId)

  if (lookId) {
    if (look.isLoading) return <div className="create-status">Loading look…</div>
    if (look.isError || !look.data) {
      return <div className="create-status create-status--error">Couldn’t load that look.</div>
    }
    const d = look.data
    return (
      <Editor
        key={lookId}
        lookId={lookId}
        initial={{
          modelId: d.garmentModelId,
          colorId: (d.colorId as unknown as string | null) ?? null,
          patternId: (d.patternId as unknown as string | null) ?? null,
          patternScale: d.material.patternScale,
          name: d.name,
        }}
      />
    )
  }
  return <Editor key="new" lookId={null} />
}

// The garment editor. Holds the backend catalog + the current selection (seeded
// from `initial` when reopening a look), and assembles the GarmentMaterial.
function Editor({ lookId, initial }: { lookId: string | null; initial?: EditorInitial }) {
  const colors = useColors()
  const patterns = usePatterns()
  const models = useModels()
  const modelId = initial?.modelId ?? models.data?.[0]?.id
  const model = useModel(modelId)

  const [selectedColorId, setSelectedColorId] = useState<string | null>(initial?.colorId ?? null)
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    initial?.patternId ?? null,
  )
  const [patternScale, setPatternScale] = useState(initial?.patternScale ?? PATTERN_SCALE.default)
  const patternDetail = usePatternDetail(selectedPatternId)

  if (models.isError || colors.isError || patterns.isError || model.isError) {
    return (
      <div className="create-status create-status--error">
        Couldn’t load the catalog. Try again.
      </div>
    )
  }

  const glbUrl = model.data?.glbUrl
  if (!glbUrl || !modelId || !colors.data || !patterns.data) {
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
        <>
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
          <SaveControls
            lookId={lookId}
            lookName={initial?.name}
            payload={{
              garmentModelId: modelId,
              colorId: activeColor?.id,
              colorHex: activeColor?.hex,
              patternId: selectedPatternId ?? undefined,
              patternScale,
            }}
          />
        </>
      }
    />
  )
}
