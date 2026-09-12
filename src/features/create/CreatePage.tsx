import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Viewer } from '../viewer'
import type { CaptureFn, GarmentMaterial } from '../viewer'
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

  const [selectedModelId, setSelectedModelId] = useState<string | null>(initial?.modelId ?? null)
  const requestedModelId = selectedModelId ?? models.data?.[0]?.id
  const model = useModel(requestedModelId)

  // The selected model can 404 without the catalog itself being broken — e.g.
  // this look references a model that's since been delisted or made private.
  // Fall back to the first other visible model
  // instead of taking down the whole editor, and say so instead of
  // pretending nothing changed.
  const modelBroken = model.isError && !!models.data?.length
  const fallbackModelId = modelBroken
    ? (models.data!.find((m) => m.id !== requestedModelId)?.id ?? models.data![0]?.id)
    : undefined
  const fallbackModel = useModel(fallbackModelId)
  const modelId = modelBroken ? fallbackModelId : requestedModelId
  const activeModel = modelBroken ? fallbackModel : model
  const unavailableNotice = modelBroken
    ? "This look's original model is no longer available — showing a substitute."
    : null

  const [selectedColorId, setSelectedColorId] = useState<string | null>(initial?.colorId ?? null)
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(
    initial?.patternId ?? null,
  )
  const [patternScale, setPatternScale] = useState(initial?.patternScale ?? PATTERN_SCALE.default)
  const patternDetail = usePatternDetail(selectedPatternId)
  const previewRef = useRef<CaptureFn | null>(null)

  const catalogBroken = models.isError || colors.isError || patterns.isError || activeModel.isError
  if (catalogBroken) {
    return (
      <div className="create-status create-status--error">
        Couldn’t load the catalog. Try again.
      </div>
    )
  }

  const glbUrl = activeModel.data?.glbUrl
  if (!glbUrl || !modelId || !colors.data || !patterns.data) {
    return <div className="create-status">Loading your studio…</div>
  }

  const activeColor = colors.data.find((c) => c.id === selectedColorId) ?? colors.data[0]
  const colorUnavailable = !!selectedColorId && !colors.data.some((c) => c.id === selectedColorId)
  const activePattern = selectedPatternId
    ? patterns.data.find((p) => p.id === selectedPatternId)
    : undefined
  const patternUnavailable = !!selectedPatternId && !activePattern
  const material: GarmentMaterial = {
    color: activeColor?.hex ?? '#f5f5f5',
    patternUrl: selectedPatternId ? (patternDetail.data?.patternUrl ?? null) : null,
    patternScale,
  }
  const notices = [
    unavailableNotice,
    colorUnavailable
      ? "This look's original color is no longer available — showing a substitute."
      : null,
    patternUnavailable
      ? "This look's original pattern is no longer available — pattern removed."
      : null,
  ].filter((n): n is string => !!n)

  return (
    <>
      {notices.length > 0 && <div className="create-notice">{notices.join(' ')}</div>}
      <Viewer
        modelUrl={glbUrl}
        material={material}
        previewRef={previewRef}
        caption={
          <>
            <span>{lookId && initial?.name ? <b>{initial.name}</b> : 'unsaved look'}</span>
            <span>
              {activeModel.data?.name} · {activeColor?.name}
              {activePattern ? ` · ${activePattern.name}` : ' · no pattern'}
            </span>
          </>
        }
        controls={
          <>
            <Wardrobe
              colors={colors.data.map((c) => ({ id: c.id, name: c.name, hex: c.hex }))}
              patterns={patterns.data.map((p) => ({
                id: p.id,
                name: p.name,
                thumbnailUrl: p.thumbnailUrl,
              }))}
              models={(models.data ?? []).map((m) => ({
                id: m.id,
                name: m.name,
                thumbnailUrl: m.thumbnailUrl,
              }))}
              selectedColorId={activeColor?.id ?? null}
              selectedPatternId={selectedPatternId}
              selectedModelId={modelId ?? null}
              patternScale={patternScale}
              onColor={(c) => setSelectedColorId(c.id)}
              onPattern={setSelectedPatternId}
              onModel={setSelectedModelId}
              onScale={setPatternScale}
            />
            <SaveControls
              lookId={lookId}
              lookName={initial?.name}
              previewRef={previewRef}
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
    </>
  )
}
