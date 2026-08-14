import { useNavigate } from 'react-router-dom'
import { useGallery } from './api'
import './gallery.css'

// Public gallery of approved looks. Cards preview the material and link to a
// read-only 3D viewer; the editor itself stays owner-only (the backend 404s
// non-owners there).
export function GalleryPage() {
  const gallery = useGallery()
  const navigate = useNavigate()

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
          const thumbnailUrl = look.thumbnailUrl as unknown as string | null
          const patternUrl = look.material.patternUrl as unknown as string | null
          return (
            <li key={look.id} className="gallery-card">
              <span
                className="gallery-card__swatch"
                style={thumbnailUrl ? undefined : { background: look.material.color }}
              >
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="gallery-card__preview"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  patternUrl && (
                    <img
                      src={patternUrl}
                      alt=""
                      className="gallery-card__pattern-img"
                      crossOrigin="anonymous"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )
                )}
                <div className="gallery-card__hover">
                  <button type="button" onClick={() => navigate(`/gallery/${look.id}`)}>
                    View in 3D
                  </button>
                </div>
              </span>
              <span className="gallery-card__name">{look.name}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
