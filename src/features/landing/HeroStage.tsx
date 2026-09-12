import { Grid, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import checksUrl from '../../assets/patterns/checks.png'
import dotsUrl from '../../assets/patterns/dots.png'
import gridUrl from '../../assets/patterns/grid.png'
import stripesUrl from '../../assets/patterns/stripes.png'
import { DraggableLight, INITIAL_LIGHT_POS, INITIAL_TRANSFORM, Model } from '../viewer'
import { PATTERN_SCALE } from '../wardrobe/config'
import './HeroStage.css'

// A fixed, hardcoded set — not the backend catalog — so this loads instantly
// and works even if the catalog is slow. Full customization still only lives
// in the real /create editor; this is a taste of it, not the editor itself.
const HERO_COLORS = [
  { id: 'ink', name: 'Ink', hex: '#1f2430' },
  { id: 'ecru', name: 'Ecru', hex: '#e7ddc8' },
  { id: 'rust', name: 'Rust', hex: '#a8532f' },
  { id: 'sage', name: 'Sage', hex: '#7c8c68' },
  { id: 'navy', name: 'Navy', hex: '#233350' },
]

const HERO_PATTERNS = [
  { id: 'stripes', name: 'Stripes', url: stripesUrl },
  { id: 'dots', name: 'Dots', url: dotsUrl },
  { id: 'checks', name: 'Checks', url: checksUrl },
  { id: 'grid', name: 'Grid', url: gridUrl },
]

// A compact, self-contained 3D demo for the landing hero: the same Model +
// DraggableLight + orbit camera the real editor uses, sized to sit inside the
// hero's photo-sized frame — not the full /create workspace (no transform
// sliders, no UV map, no wardrobe-style dropdowns). Controls are plain swatch
// buttons underneath the canvas.
export function HeroStage({ modelUrl }: { modelUrl: string }) {
  const [colorId, setColorId] = useState(HERO_COLORS.at(-1)?.id)
  const [patternId, setPatternId] = useState<string | null>(HERO_PATTERNS[0].id)
  const [lightOn, setLightOn] = useState(false)
  const [lightPos, setLightPos] = useState(INITIAL_LIGHT_POS)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)

  const activeColor = HERO_COLORS.find((c) => c.id === colorId) ?? HERO_COLORS[0]
  const activePattern = patternId ? HERO_PATTERNS.find((p) => p.id === patternId) : undefined

  return (
    <div className="hero-stage">
      <div className="hero-stage__canvas">
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
          <color attach="background" args={['#2b2f3a']} />
          <ambientLight intensity={0.6} />
          <DraggableLight
            position={lightPos}
            onChange={setLightPos}
            draggable={lightOn}
            controlsRef={orbitRef}
          />
          <Grid
            position={[0, -1, 0]}
            args={[10, 10]}
            cellColor="#4a5060"
            sectionColor="#8a93a6"
            fadeDistance={30}
            infiniteGrid
          />
          <Suspense fallback={null}>
            <Model
              url={modelUrl}
              transform={INITIAL_TRANSFORM}
              material={{
                color: activeColor.hex,
                patternUrl: activePattern?.url ?? null,
                patternScale: PATTERN_SCALE.default,
              }}
            />
          </Suspense>
          <OrbitControls ref={orbitRef} makeDefault enableDamping target={[0, 0, 0]} />
        </Canvas>
        <button
          type="button"
          className={`hero-stage__light${lightOn ? ' hero-stage__light--on' : ''}`}
          onClick={() => setLightOn((v) => !v)}
        >
          {lightOn ? 'Drag the light ●' : 'Light source'}
        </button>
      </div>
      <div className="hero-stage__swatches">
        <div className="hero-stage__row">
          {HERO_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`hero-stage__swatch${c.id === colorId ? ' hero-stage__swatch--active' : ''}`}
              style={{ background: c.hex }}
              title={c.name}
              aria-label={`Color: ${c.name}`}
              onClick={() => setColorId(c.id)}
            />
          ))}
        </div>
        <div className="hero-stage__row">
          <button
            type="button"
            className={`hero-stage__swatch hero-stage__swatch--none${!patternId ? ' hero-stage__swatch--active' : ''}`}
            title="No pattern"
            aria-label="No pattern"
            onClick={() => setPatternId(null)}
          >
            —
          </button>
          {HERO_PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`hero-stage__swatch${p.id === patternId ? ' hero-stage__swatch--active' : ''}`}
              style={{ backgroundImage: `url(${p.url})` }}
              title={p.name}
              aria-label={`Pattern: ${p.name}`}
              onClick={() => setPatternId(p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
