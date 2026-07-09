import { Bounds, Grid, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import type { ReactNode } from 'react'
import { Toggle } from '../../shared/Toggle'
import { INITIAL_TRANSFORM } from './config'
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

// Upper-front-right of the model, close enough to sit inside the default frame
// so the "Light source" sphere is actually visible. (A directional light's
// distance doesn't affect brightness — only its direction — so near is fine.)
const LIGHT_POS: [number, number, number] = [1.3, 1.6, 1.8]

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
}: {
  modelUrl: string
  material: GarmentMaterial
  controls?: ReactNode
}) {
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)
  const [scene, setScene] = useState<SceneOptions>(INITIAL_SCENE)

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
          <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
            <color attach="background" args={['#2b2f3a']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={LIGHT_POS} intensity={1.2} />
            {scene.light && (
              <mesh position={LIGHT_POS}>
                <sphereGeometry args={[0.25, 20, 20]} />
                <meshBasicMaterial color="#fff3c0" />
              </mesh>
            )}
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
            <OrbitControls makeDefault enableDamping enablePan={scene.pan} target={[0, 0, 0]} />
          </Canvas>
        </div>
      </div>
    </div>
  )
}
