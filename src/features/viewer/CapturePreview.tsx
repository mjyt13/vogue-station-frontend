import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { MutableRefObject } from 'react'

export type CaptureFn = () => Promise<Blob>

// Renders one extra frame of the already-mounted scene on demand and encodes it
// as a PNG blob — a static snapshot of whatever's currently on screen, unlike
// wardrobe/captureModelThumbnail.tsx which spins up its own offscreen turntable
// scene. Exposes the capture through a ref because a Canvas's gl/scene/camera
// only exist inside react-three-fiber's tree (via useThree), while the caller
// (SaveControls) lives outside the Canvas.
export function CapturePreview({
  captureRef,
}: {
  captureRef: MutableRefObject<CaptureFn | null>
}) {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    captureRef.current = () =>
      new Promise((resolve, reject) => {
        gl.render(scene, camera)
        gl.domElement.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Could not capture a preview of this look'))
        }, 'image/png')
      })
    return () => {
      captureRef.current = null
    }
  }, [gl, scene, camera, captureRef])
  return null
}
