import { lazy, Suspense, useEffect, useState } from 'react'
import { useModel, useModels } from '../create/api'
import './HeroPreview.css'

// The real 3D stage pulls in three.js — kept out of the landing page's main
// bundle and only fetched once a visitor actually asks to try the tool.
const HeroStage = lazy(() => import('./HeroStage').then((m) => ({ default: m.HeroStage })))

// Time the blurred photo spends fading out before the live stage mounts —
// matches the CSS transition duration in HeroPreview.css.
const REVEAL_MS = 450

type Phase = 'photo' | 'revealing' | 'live'

// The landing hero: a static photo until the visitor asks to try the tool.
// Once a garment model is actually ready, hovering the photo blurs it and
// zooms/fades in a "try creating a look" headline on top of the blur itself
// (nothing sits on the crisp photo); clicking it blurs the rest of the way
// out and a real, playable 3D stage (fixed color/pattern set, real garment
// model) deblurs in, contained in the same frame the photo occupied.
export function HeroPreview({ photoSrc, photoAlt }: { photoSrc: string; photoAlt: string }) {
  const [phase, setPhase] = useState<Phase>('photo')

  const models = useModels()
  const tshirt = models.data?.find((m) => m.kind === 'TSHIRT') ?? models.data?.[0]
  const model = useModel(tshirt?.id)
  const glbUrl = model.data?.glbUrl
  const ready = !!glbUrl

  useEffect(() => {
    if (phase !== 'revealing') return
    const timer = setTimeout(() => setPhase('live'), REVEAL_MS)
    return () => clearTimeout(timer)
  }, [phase])

  const interactive = ready && phase === 'photo'

  return (
    <figure className="hero-preview">
      {phase !== 'live' && (
        <div
          className={`hero-preview__frame${interactive ? ' hero-preview__frame--interactive' : ''}${
            phase === 'revealing' ? ' hero-preview__frame--out' : ''
          }`}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onClick={() => interactive && setPhase('revealing')}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) setPhase('revealing')
          }}
        >
          <img className="hero-preview__photo" src={photoSrc} alt={photoAlt} />
          {interactive && <h2 className="hero-preview__text">Try creating a look</h2>}
        </div>
      )}
      {phase === 'live' && glbUrl && (
        <div className="hero-preview__stage">
          <Suspense fallback={<div className="hero-preview__loading">Loading studio…</div>}>
            <HeroStage modelUrl={glbUrl} />
          </Suspense>
        </div>
      )}
    </figure>
  )
}
