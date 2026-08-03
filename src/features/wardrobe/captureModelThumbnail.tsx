import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { MathUtils, Vector3 } from 'three'
import { ErrorBoundary } from '../../shared/ErrorBoundary'
import { INITIAL_TRANSFORM, Model } from '../viewer'
import { CaptureOnReady, ReportRenderError } from './ModelThumbnailCapture'

const YAW_DEG = 45 // turntable rotation around the vertical (Y) axis
const PITCH_DEG = 30 // camera tilt around the X axis
// Tuned for Model's TARGET_SIZE (2 world units) — same order of magnitude as
// the main viewer's default camera position ([0, 1, 5]).
const CAMERA_DISTANCE = 5.2
const CAPTURE_SIZE = 256
// Generous: a real GLTF parse+render is a couple of seconds even on modest
// hardware, this only guards against a genuinely hung/unsupported file.
const CAPTURE_TIMEOUT_MS = 20000

function cameraPosition(): [number, number, number] {
  const yaw = MathUtils.degToRad(YAW_DEG)
  const pitch = MathUtils.degToRad(PITCH_DEG)
  const dir = new Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    Math.cos(yaw) * Math.cos(pitch),
  ).normalize()
  return [dir.x * CAMERA_DISTANCE, dir.y * CAMERA_DISTANCE, dir.z * CAMERA_DISTANCE]
}

/**
 * Renders a freshly picked .glb file offscreen at a fixed 3/4 angle
 * (45° yaw, 30° tilt) and captures a PNG thumbnail — used to preview a model
 * before it's ever uploaded. Mounts its own detached React root; nothing here
 * touches the app's main viewer or its mounted Canvas.
 */
export function captureModelThumbnail(file: File): Promise<Blob> {
  if (import.meta.env.DEV) console.debug('[model-thumbnail]', 'starting capture for', file.name)
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = `${CAPTURE_SIZE}px`
    container.style.height = `${CAPTURE_SIZE}px`
    container.style.pointerEvents = 'none'
    document.body.appendChild(container)

    const blobUrl = URL.createObjectURL(file)
    const root = createRoot(container)

    let settled = false
    const timer = setTimeout(() => {
      settle(() =>
        reject(new Error('Could not render a preview of this model — try a different file')),
      )
    }, CAPTURE_TIMEOUT_MS)

    function settle(fn: () => void) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn()
      root.unmount()
      container.remove()
      URL.revokeObjectURL(blobUrl)
    }

    root.render(
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={1}
        frameloop="demand"
        camera={{ position: cameraPosition(), fov: 50 }}
      >
        <color attach="background" args={['#2b2f3a']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <ErrorBoundary
          fallback={() => (
            <ReportRenderError
              onError={() =>
                settle(() =>
                  reject(
                    new Error('Could not render a preview of this model — check the .glb file'),
                  ),
                )
              }
            />
          )}
        >
          <Suspense fallback={null}>
            <Model url={blobUrl} transform={INITIAL_TRANSFORM} />
            <CaptureOnReady
              onCapture={(blob) => settle(() => resolve(blob))}
              onError={(error) => settle(() => reject(error))}
            />
          </Suspense>
        </ErrorBoundary>
      </Canvas>,
    )
  })
}
