import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import './ColorWheel.css'

const SIZE = 160
const RADIUS = SIZE / 2

// A hue/saturation wheel: angle around the circle is hue, distance from
// center is saturation. Lightness isn't represented here — the picker keeps
// a separate slider for that, same as most HSL wheel widgets. Simplest
// control we could add for now; a nicer combined widget can replace it later.
export const ColorWheel = (props: { hue: number; sat: number; onChange: (next: { h: number; s: number }) => void }) => {
  const ref = useRef<HTMLDivElement>(null)

  const setFromPoint = (clientX: number, clientY: number) => {
    const rect = ref.current!.getBoundingClientRect()
    const x = clientX - rect.left - RADIUS
    const y = clientY - rect.top - RADIUS
    const dist = Math.min(Math.hypot(x, y), RADIUS)
    let angle = (Math.atan2(y, x) * 180) / Math.PI
    if (angle < 0) angle += 360
    props.onChange({ h: Math.round(angle), s: Math.round((dist / RADIUS) * 100) })
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromPoint(e.clientX, e.clientY)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return
    setFromPoint(e.clientX, e.clientY)
  }

  const angleRad = (props.hue * Math.PI) / 180
  const thumbDist = (props.sat / 100) * RADIUS
  const thumbX = RADIUS + Math.cos(angleRad) * thumbDist
  const thumbY = RADIUS + Math.sin(angleRad) * thumbDist

  return (
    <div
      ref={ref}
      className="color-wheel"
      style={{ width: SIZE, height: SIZE }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
    >
      <span className="color-wheel__thumb" style={{ left: thumbX, top: thumbY }} />
    </div>
  )
}
