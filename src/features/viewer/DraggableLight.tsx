import type { ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import type { RefObject } from 'react'

// Screen-pixels-to-radians for the light drag — tuned to feel similar to
// OrbitControls' own rotate speed.
const LIGHT_DRAG_SPEED = 0.01
// Clamp the polar angle to 35°-85° from straight up. Combined with the ~1.8
// orbit radius (INITIAL_LIGHT_POS), this keeps the marker inside the default
// camera's frame at *any* azimuth — verified by projecting the full angle
// grid through the same camera setup. Outside this band (near-overhead or
// near-the-floor), a wider radius would be needed to still look reasonable,
// and it starts clipping out of frame instead — which reads as "dragging
// does nothing" even though the position is updating.
const MIN_POLAR = 0.61
const MAX_POLAR = 1.48

const cartesianToSpherical = ([x, y, z]: [number, number, number]) => {
  const radius = Math.hypot(x, y, z)
  return { radius, theta: Math.atan2(x, z), phi: Math.acos(y / radius) }
}

const sphericalToCartesian = (
  radius: number,
  theta: number,
  phi: number,
): [number, number, number] => [
  radius * Math.sin(phi) * Math.sin(theta),
  radius * Math.cos(phi),
  radius * Math.sin(phi) * Math.cos(theta),
]

// Anything with an `.enabled` switch we can pause mid-drag — OrbitControls'
// own listeners are native DOM listeners on the canvas, so R3F's
// stopPropagation doesn't reach them; without pausing it, picking up the
// light would spin the camera underneath it at the same time.
type PausableControls = { enabled: boolean }

// The scene's directional light, rendered at `position`. When `draggable`,
// pressing and dragging on its marker sphere (any mouse button — the pick-up
// is scoped to the sphere itself, so it never competes with orbiting
// elsewhere on the canvas) orbits the light around the model, distance from
// center held fixed, so the toggle actually changes where shading comes from
// instead of just showing a decorative marker.
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
  const dragging = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!draggable) return
    event.stopPropagation()
    dragging.current = true
    last.current = { x: event.clientX, y: event.clientY }
    if (controlsRef?.current) controlsRef.current.enabled = false
    ;(event.target as Element).setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !last.current) return
    event.stopPropagation()
    const dx = event.clientX - last.current.x
    const dy = event.clientY - last.current.y
    last.current = { x: event.clientX, y: event.clientY }

    const { radius, theta, phi } = cartesianToSpherical(position)
    const nextPhi = Math.min(Math.max(phi - dy * LIGHT_DRAG_SPEED, MIN_POLAR), MAX_POLAR)
    const nextTheta = theta - dx * LIGHT_DRAG_SPEED
    onChange(sphericalToCartesian(radius, nextTheta, nextPhi))
  }

  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging.current) return
    dragging.current = false
    last.current = null
    if (controlsRef?.current) controlsRef.current.enabled = true
    ;(event.target as Element).releasePointerCapture?.(event.pointerId)
  }

  return (
    <>
      <directionalLight position={position} intensity={1.2} />
      {draggable && (
        <mesh
          position={position}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          <sphereGeometry args={[0.32, 20, 20]} />
          <meshBasicMaterial color="#fff3c0" />
        </mesh>
      )}
    </>
  )
}
