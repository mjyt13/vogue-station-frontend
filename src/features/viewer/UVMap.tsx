import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Mesh } from 'three'
import type { GarmentMaterial } from './types'

const SIZE = 480 // internal canvas resolution (drawn at 2x for crispness)
const PAD = 20
const MAX_TRIS = 1500 // wireframe is subsampled — the model has ~370k triangles

type Geo = { uv: ArrayLike<number>; index: ArrayLike<number> | null }

// A 2D preview of the garment's UV unwrap. Because color and pattern share the
// same UVs, this shows exactly what the 3D material does: pattern tiled through
// the UVs, multiplied by the color (canvas 'multiply' == the shader's map×color).
// The dashed square marks one [0,1] texture tile; the UVs run past it, which is
// why a small pattern repeats across the whole shirt.
export function UVMap({ url, material }: { url: string; material: GarmentMaterial }) {
  const { scene } = useGLTF(url)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState<{ url: string; img: HTMLImageElement } | null>(null)

  // Collect every mesh's UVs + indices, and the overall UV bounds, once.
  const { geos, bounds } = useMemo(() => {
    const geos: Geo[] = []
    let minU = Infinity, minV = Infinity, maxU = -Infinity, maxV = -Infinity
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const uvAttr = obj.geometry.getAttribute('uv')
      if (!uvAttr) return
      const uv = uvAttr.array as ArrayLike<number>
      geos.push({ uv, index: obj.geometry.index?.array ?? null })
      for (let i = 0; i < uv.length; i += 2) {
        minU = Math.min(minU, uv[i]); maxU = Math.max(maxU, uv[i])
        minV = Math.min(minV, uv[i + 1]); maxV = Math.max(maxV, uv[i + 1])
      }
    })
    return { geos, bounds: { minU, minV, maxU, maxV } }
  }, [scene])

  // Load the pattern image (for the tiled background) when it changes. The null
  // case needs no setState — the draw effect resolves `pattern` to null below.
  const patternUrl = material.patternUrl
  useEffect(() => {
    if (!patternUrl) return
    const img = new Image()
    img.onload = () => setLoaded({ url: patternUrl, img })
    img.src = patternUrl
    return () => { img.onload = null }
  }, [patternUrl])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pattern = loaded && loaded.url === patternUrl ? loaded.img : null
    const { minU, minV, maxU, maxV } = bounds
    const spanU = maxU - minU || 1
    const spanV = maxV - minV || 1
    // Uniform scale keeps pattern tiles square (undistorted).
    const k = (SIZE - 2 * PAD) / Math.max(spanU, spanV)
    const x = (u: number) => PAD + (u - minU) * k
    const y = (v: number) => SIZE - PAD - (v - minV) * k // V up, like texture space

    ctx.clearRect(0, 0, SIZE, SIZE)

    // Fabric region = the UV bounding box. Fill it with pattern×color (or just
    // color when there's no pattern) — the same math the 3D shader runs.
    const rx = x(minU), ry = y(maxV), rw = spanU * k, rh = spanV * k
    if (pattern) {
      const tile = ctx.createPattern(pattern, 'repeat')!
      const m = new DOMMatrix().scale(k / pattern.width, k / pattern.height)
      tile.setTransform(m)
      ctx.fillStyle = tile
      ctx.fillRect(rx, ry, rw, rh)
      ctx.globalCompositeOperation = 'multiply'
      ctx.fillStyle = material.color
      ctx.fillRect(rx, ry, rw, rh)
      ctx.globalCompositeOperation = 'source-over'
    } else {
      ctx.fillStyle = material.color
      ctx.fillRect(rx, ry, rw, rh)
    }

    // Subsampled wireframe so the mesh islands are visible without freezing.
    const total = geos.reduce((n, g) => n + (g.index ? g.index.length : g.uv.length / 2) / 3, 0)
    const step = Math.max(1, Math.ceil(total / MAX_TRIS))
    ctx.strokeStyle = 'rgba(0,0,0,0.28)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    let tri = 0
    for (const g of geos) {
      const triCount = (g.index ? g.index.length : g.uv.length / 2) / 3
      for (let t = 0; t < triCount; t++, tri++) {
        if (tri % step) continue
        const vi = (c: number) => (g.index ? g.index[t * 3 + c] : t * 3 + c)
        const p = (c: number) => { const i = vi(c) * 2; return [x(g.uv[i]), y(g.uv[i + 1])] as const }
        const a = p(0), b = p(1), c = p(2)
        ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath()
      }
    }
    ctx.stroke()

    // Reference: one [0,1] texture tile. UVs spilling past it => the tile repeats.
    ctx.strokeStyle = 'rgba(58,110,214,0.9)'
    ctx.setLineDash([5, 4])
    ctx.lineWidth = 1.5
    ctx.strokeRect(x(0), y(1), 1 * k, 1 * k)
    ctx.setLineDash([])
  }, [geos, bounds, material.color, patternUrl, loaded])

  return (
    <figure className="uv-map">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} />
      <figcaption>UV map — dashed square = one texture tile</figcaption>
    </figure>
  )
}
