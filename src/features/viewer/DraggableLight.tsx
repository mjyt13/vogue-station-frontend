import { useThree } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { Raycaster, Sphere, Vector2, Vector3 } from 'three'

// Clamp the polar angle to 35°-85° from straight up. Combined with the ~1.8
// orbit radius (INITIAL_LIGHT_POS), this keeps the marker inside the default
// camera's frame at *any* azimuth — verified by projecting the full angle
// grid through the same camera setup. Outside this band (near-overhead or
// near-the-floor), a wider radius would be needed to still look reasonable,
// and it starts clipping out of frame instead — which reads as "dragging
// does nothing" even though the position is updating.
const MIN_POLAR = 0.61
const MAX_POLAR = 1.48

const clampPolar = (point: Vector3, radius: number): [number, number, number] => {
  const theta = Math.atan2(point.x, point.z)
  const phi = Math.min(Math.max(Math.acos(point.y / point.length()), MIN_POLAR), MAX_POLAR)
  return [
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta),
  ]
}

// Anything with an `.enabled` switch we can pause mid-drag — OrbitControls'
// own listeners are native DOM listeners on the canvas, so R3F's
// stopPropagation doesn't reach them; without pausing it, picking up the
// light would spin the camera underneath it at the same time.
type PausableControls = { enabled: boolean }

// The scene's directional light, rendered at `position`. When `draggable`,
// pressing on its marker sphere picks it up and the marker then follows the
// cursor: the pointer ray is cast onto the (camera-facing side of the)
// sphere the light lives on, so dragging down moves the light down on
// screen, left moves it left, etc. — whatever the camera angle. Distance
// from center stays fixed, so only the direction of the shading changes.
export function DraggableLight({
  position,
  onChange,
  draggable,
  controlsRef,
}: {
  position: [number, number, number]
  onChange: (position: [number, number, number]) => void
  draggable: boolean
  // The Viewer's OrbitControls instance, paused for the duration of a drag.
  controlsRef?: RefObject<PausableControls | null>
}) {
  const { camera, gl } = useThree()
  const radius = Math.hypot(...position)
  // Latest values for the window listeners, which outlive a single render.
  const latest = useRef({ camera, gl, radius, onChange, controlsRef })
  useEffect(() => {
    latest.current = { camera, gl, radius, onChange, controlsRef }
  })
  const stopDrag = useRef<(() => void) | null>(null)
  useEffect(() => () => stopDrag.current?.(), [])

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!draggable || stopDrag.current) return
    event.stopPropagation()
    if (controlsRef?.current) controlsRef.current.enabled = false

    const raycaster = new Raycaster()
    const ndc = new Vector2()
    const hit = new Vector3()
    const closest = new Vector3()

    // Listeners go on the window, not the marker mesh: the marker is small
    // and the cursor easily outruns it, which used to drop the drag.
    const onMove = (e: PointerEvent) => {
      const { camera, gl, radius, onChange } = latest.current
      const rect = gl.domElement.getBoundingClientRect()
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const sphere = new Sphere(new Vector3(), radius)
      // Missed the sphere (cursor outside its silhouette): pin the light to
      // the rim point nearest the cursor ray instead of freezing it.
      const point =
        raycaster.ray.intersectSphere(sphere, hit) ??
        raycaster.ray.closestPointToPoint(sphere.center, closest).setLength(radius)
      onChange(clampPolar(point, radius))
    }

    const onUp = () => stopDrag.current?.()

    stopDrag.current = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      const controls = latest.current.controlsRef?.current
      if (controls) controls.enabled = true
      stopDrag.current = null
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <>
      <directionalLight position={position} intensity={1.2} />
      {draggable && (
        <mesh position={position} onPointerDown={onPointerDown}>
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshBasicMaterial color="#fff3c0" />
        </mesh>
      )}
    </>
  )
}
