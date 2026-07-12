import { useGallery } from './api'
import './gallery.css'

// Public gallery of approved looks. View-only: other people's looks can't be
// opened in the editor (the backend 404s non-owners), so cards just preview
// the material.
export function GalleryPage() {
  const gallery = useGallery()

  return (
    <div className="gallery">
      <h2>Gallery</h2>
      {gallery.isLoading && <p className="gallery-status">Loading…</p>}
      {gallery.isError && (
        <p className="gallery-status gallery-status--error">Couldn’t load the gallery.</p>
      )}
      {gallery.data?.length === 0 && (
        <p className="gallery-status">Nothing here yet — published looks appear once approved.</p>
      )}
      <ul className="gallery-grid">
        {gallery.data?.map((look) => {
          const patternUrl = look.material.patternUrl as unknown as string | null
          return (
            <li key={look.id} className="gallery-card">
              <span className="gallery-card__swatch" style={{ background: look.material.color }}>
                {patternUrl && (
                  <img
                    src={patternUrl}
                    alt=""
                    crossOrigin="anonymous"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </span>
              <span className="gallery-card__name">{look.name}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
