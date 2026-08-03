import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug('[model-thumbnail]', ...args)
}

// Fires once the model has finished loading (Suspense resolved): aims the
// camera at the origin, renders exactly one frame, and captures it.
export function CaptureOnReady({
  onCapture,
  onError,
}: {
  onCapture: (blob: Blob) => void
  onError: (error: Error) => void
}) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    debug('CaptureOnReady effect fired')
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    const raf = requestAnimationFrame(() => {
      debug('rendering frame')
      gl.render(scene, camera)
      debug('rendered, encoding blob')
      gl.domElement.toBlob((blob) => {
        debug('toBlob callback', blob ? `${blob.size} bytes` : 'null')
        if (blob) onCapture(blob)
        else onError(new Error('Could not encode the model preview'))
      }, 'image/png')
    })
    return () => cancelAnimationFrame(raf)
  }, [gl, scene, camera, onCapture, onError])
  return null
}

// Reports a render failure (e.g. an invalid .glb) from a safe post-commit
// effect, so the caller's promise can reject without unmounting mid-render.
export function ReportRenderError({ onError }: { onError: () => void }) {
  useEffect(() => onError(), [onError])
  return null
}
