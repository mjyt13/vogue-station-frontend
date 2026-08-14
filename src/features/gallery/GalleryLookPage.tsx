import { useParams } from 'react-router-dom'
import { useModel } from '../create/api'
import { Viewer } from '../viewer'
import type { GarmentMaterial } from '../viewer'
import { useGallery } from './api'
import './gallery.css'

// Read-only viewer for one gallery look, opened from a GalleryPage card.
// Looks up the look in the (already-cached) gallery list rather than
// GET /looks/{id} — that endpoint 404s for anyone but the owner, but every
// look here is public by definition (it's in the approved gallery).
export function GalleryLookPage() {
  const { lookId } = useParams()
  const gallery = useGallery()
  const look = gallery.data?.find((item) => item.id === lookId)
  const model = useModel(look?.garmentModelId)

  if (gallery.isError || model.isError) {
    return <p className="gallery-status gallery-status--error">Couldn’t load that look.</p>
  }
  if (gallery.isLoading) return <div className="gallery-status">Loading…</div>
  if (!look) return <p className="gallery-status">That look isn’t in the gallery.</p>

  // Model fetch only starts once `look` resolves `garmentModelId`, so gallery
  // loading finishing isn't enough — wait for glbUrl too, otherwise Viewer
  // mounts with modelUrl="" and the GLTF loader chokes on index.html.
  const glbUrl = model.data?.glbUrl
  if (!glbUrl) return <div className="gallery-status">Loading…</div>

  const material: GarmentMaterial = {
    color: look.material.color,
    patternUrl: look.material.patternUrl as unknown as string | null,
    patternScale: look.material.patternScale,
  }

  return (
    <div className="gallery">
      <h2>{look.name}</h2>
      <Viewer modelUrl={glbUrl} material={material} />
    </div>
  )
}
