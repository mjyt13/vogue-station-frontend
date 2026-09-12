import { Bounds, Grid, OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef, useState } from 'react'
import type { MutableRefObject, ReactNode } from 'react'
import { ErrorBoundary } from '../../shared/ErrorBoundary'
import { Toggle } from '../../shared/Toggle'
import { CapturePreview } from './CapturePreview'
import type { CaptureFn } from './CapturePreview'
import { INITIAL_LIGHT_POS, INITIAL_TRANSFORM } from './config'
import { DraggableLight } from './DraggableLight'
import { Model } from './Model'
import { TransformPanel } from './TransformPanel'
import { UVMap } from './UVMap'
import type { Axis, GarmentMaterial, Kind, Transform } from './types'
import './Viewer.css'

// Scene options are viewer/camera concerns (not part of the garment material).
// Config-driven like the sliders: one Toggle per entry, one handler.
type SceneOptions = { pan: boolean; autoFrame: boolean; light: boolean }
const INITIAL_SCENE: SceneOptions = { pan: true, autoFrame: false, light: false }
const SCENE_TOGGLES: { key: keyof SceneOptions; label: string }[] = [
  { key: 'pan', label: 'Pan' },
  { key: 'autoFrame', label: 'Auto-frame' },
  { key: 'light', label: 'Light source' },
]

// The viewer renders a garment (given a GarmentMaterial) in a controllable 3D
// scene. It owns the transform + scene-option state; the material comes from the
// wardrobe via props, so the viewer knows nothing about the color/pattern catalog.
//
// Layout: everything the user tweaks (the `controls` slot — App fills it with the
// wardrobe — plus scene toggles, transform sliders, and the UV map) sits in the
// left column; the 3D viewport is the right column.
export function Viewer({
  modelUrl,
  material,
  controls,
  caption,
  previewRef,
}: {
  modelUrl: string
  material: GarmentMaterial
  controls?: ReactNode
  caption?: ReactNode
  // When given, a CapturePreview mounts inside the Canvas and keeps this ref
  // set to a function that snapshots whatever's currently rendered.
  previewRef?: MutableRefObject<CaptureFn | null>
}) {
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)
  const [scene, setScene] = useState<SceneOptions>(INITIAL_SCENE)
  const [lightPos, setLightPos] = useState<[number, number, number]>(INITIAL_LIGHT_POS)
  const orbitRef = useRef<OrbitControlsImpl | null>(null)

  // One function handles all 6 actions: which group, which axis, new value.
  const setAxis = (kind: Kind, axis: Axis, value: number) =>
    setTransform((prev) => ({ ...prev, [kind]: { ...prev[kind], [axis]: value } }))

  const model = <Model url={modelUrl} transform={transform} material={material} />

  return (
    <div className="workspace">
      <div className="workspace__controls">
        {controls}
        <div className="scene-options">
          {SCENE_TOGGLES.map(({ key, label }) => (
            <Toggle
              key={key}
              label={label}
              checked={scene[key]}
              onChange={(checked) => setScene((prev) => ({ ...prev, [key]: checked }))}
            />
          ))}
        </div>
        <TransformPanel transform={transform} onChange={setAxis} />
        <Suspense fallback={null}>
          <UVMap url={modelUrl} material={material} />
        </Suspense>
      </div>

      <div className="workspace__viewport">
        <div className="viewport-canvas">
          <ErrorBoundary
            resetKeys={[modelUrl]}
            fallback={(reset) => (
              <div className="viewport-error">
                <p>Couldn’t load the 3D preview.</p>
                <button type="button" onClick={reset}>
                  Retry
                </button>
              </div>
            )}
          >
            <Canvas camera={{ position: [0, 1, 5], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
              {previewRef && <CapturePreview captureRef={previewRef} />}
              <color attach="background" args={['#2b2f3a']} />
              <ambientLight intensity={0.6} />
              <DraggableLight
                position={lightPos}
                onChange={setLightPos}
                draggable={scene.light}
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
                {scene.autoFrame ? (
                  <Bounds fit clip observe margin={1.2}>
                    {model}
                  </Bounds>
                ) : (
                  model
                )}
              </Suspense>
              <OrbitControls
                ref={orbitRef}
                makeDefault
                enableDamping
                enablePan={scene.pan}
                target={[0, 0, 0]}
              />
            </Canvas>
          </ErrorBoundary>
        </div>
        {caption && <div className="viewport-caption">{caption}</div>}
      </div>
    </div>
  )
}
