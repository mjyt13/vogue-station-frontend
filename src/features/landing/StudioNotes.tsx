import { useEffect, useRef, useState } from 'react'
import cabinetShot from '../../assets/landing/cabinet.png'
import controlsShot from '../../assets/landing/controls.png'
import galleryShot from '../../assets/landing/gallery.png'
import lookCardShot from '../../assets/landing/look-card.png'
import viewportShot from '../../assets/landing/viewport.png'
import './StudioNotes.css'

type TearData = { src: string; alt: string; caption: string; position: string }

const TEARS: TearData[] = [
  {
    src: viewportShot,
    alt: '3D viewport with a garment on a grid floor',
    caption: 'FIG. 01 — live viewport',
    position: 'tear--1',
  },
  {
    src: controlsShot,
    alt: 'Model, color, and pattern swatch controls',
    caption: 'FIG. 02 — model / color / pattern rack',
    position: 'tear--2',
  },
  {
    src: lookCardShot,
    alt: 'A single published look card',
    caption: 'FIG. 03 — look card, detail',
    position: 'tear--3',
  },
  {
    src: galleryShot,
    alt: 'Public gallery grid of published looks',
    caption: 'FIG. 04 — public gallery',
    position: 'tear--4',
  },
  {
    src: cabinetShot,
    alt: 'Cabinet view listing saved looks',
    caption: 'FIG. 05 — the cabinet',
    position: 'tear--5',
  },
]

// Reveals an element once it scrolls into view, then stops watching it.
function useRevealOnView() {
  const ref = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.unobserve(el)
        }
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, inView }
}

function Tear({ tear }: { tear: TearData }) {
  const { ref, inView } = useRevealOnView()
  return (
    <figure ref={ref} className={`tear ${tear.position}${inView ? ' tear--in-view' : ''}`}>
      <span className="tear__pin" />
      <img src={tear.src} alt={tear.alt} />
      <figcaption>{tear.caption}</figcaption>
    </figure>
  )
}

// "Studio notes": real screenshots of the working app, styled as scattered
// torn tear-sheets, revealed as the visitor scrolls down to them.
export function StudioNotes() {
  return (
    <section className="studio-notes">
      <div className="studio-notes__inner">
        <div className="studio-notes__head">
          <span className="eyebrow">Studio notes</span>
          <h2>What building a look actually looks like</h2>
          <p>
            Tear sheets from the working app — the viewport, the swatch rack, the cabinet, and the
            public gallery, as they look mid-session.
          </p>
        </div>
        <div className="studio-notes__board">
          {TEARS.map((tear) => (
            <Tear key={tear.position} tear={tear} />
          ))}
        </div>
      </div>
    </section>
  )
}
