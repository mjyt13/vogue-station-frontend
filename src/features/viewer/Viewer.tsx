import { Canvas } from '@react-three/fiber'
import { Suspense, useState } from 'react'
import { INITIAL_TRANSFORM } from './config'
import { Model } from './Model'
import { TransformPanel } from './TransformPanel'
import type { Axis, Kind, Transform } from './types'

// The viewer owns the transform state, the control panel, and the 3D scene.
// It picks which model URL to show; Model handles loading and framing it.
export function Viewer({ modelUrl }: { modelUrl: string }) {
  const [transform, setTransform] = useState<Transform>(INITIAL_TRANSFORM)

  // One function handles all 6 actions: which group, which axis, new value.
  const setAxis = (kind: Kind, axis: Axis, value: number) =>
    setTransform((prev) => ({ ...prev, [kind]: { ...prev[kind], [axis]: value } }))

  return (
    <>
      <TransformPanel transform={transform} onChange={setAxis} />
      <div id="canvas-container" style={{ width: '100%', height: '500px' }}>
        <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
          <color attach="background" args={['#2b2f3a']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 3, 5]} intensity={1.2} />
          <gridHelper args={[10, 20, '#8a93a6', '#4a5060']} position={[0, -1, 0]} />
          <Suspense fallback={null}>
            <Model url={modelUrl} transform={transform} />
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}
