import { useGLTF, useTexture } from '@react-three/drei'
import { useLayoutEffect, useMemo } from 'react'
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { TARGET_SIZE } from './config'
import type { GarmentMaterial, Transform } from './types'

// A 1x1 white pixel. useTexture (a hook) can't be called conditionally, so when
// there's no pattern we load this and simply don't assign it as a map.
const BLANK =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

// A single GLB garment placed under a user-driven transform.
//
// On load, once per instance (see useMemo):
//   1. Clone the scene AND its materials — useGLTF caches by URL, so every
//      viewer shares one object; cloning keeps each user's edits independent.
//   2. Recenter + scale to TARGET_SIZE (unknown native units/origin), and force
//      cloth-like PBR (source ships metalness ~0.77, which reads muddy).
//
// Color and pattern are applied in a separate layout effect: they change often
// and are cheap, so they shouldn't trigger a re-clone. Final surface = map × color.
export function Model({
  url,
  transform,
  material,
}: {
  url: string
  transform: Transform
  material?: GarmentMaterial
}) {
  const { scene } = useGLTF(url)
  const { position, rotation } = transform
  const patternUrl = material?.patternUrl ?? null
  const patternScale = material?.patternScale ?? 1
  const rawTexture = useTexture(patternUrl ?? BLANK)
  // Clone so we can configure this instance's sampler without mutating the
  // cached hook value. RepeatWrapping is essential: the fabric UVs run past
  // [0,1], so it tiles the pattern; without it they'd clamp to a flat edge color.
  // High anisotropy keeps the tiling crisp where the surface is dense/angled.
  // Re-runs on scale changes — cloning a texture is cheap (it shares the image).
  const texture = useMemo(() => {
    const t = rawTexture.clone()
    t.colorSpace = SRGBColorSpace
    t.wrapS = t.wrapT = RepeatWrapping
    t.anisotropy = 16
    t.repeat.set(patternScale, patternScale)
    t.needsUpdate = true
    return t
  }, [rawTexture, patternScale])

  const { root, offset, scale } = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const mat = (obj.material as MeshStandardMaterial).clone()
      mat.metalness = 0
      mat.roughness = 0.9
      obj.material = mat
    })

    const box = new Box3().setFromObject(root)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = TARGET_SIZE / maxDim
    return { root, offset: center.multiplyScalar(-scale), scale }
  }, [scene])

  useLayoutEffect(() => {
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const mat = obj.material as MeshStandardMaterial
      if (material?.color) mat.color.set(material.color)
      mat.map = patternUrl ? texture : null // toggling a map changes the shader…
      mat.needsUpdate = true // …so recompile is required
    })
  }, [root, material?.color, patternUrl, texture])

  // Outer group = user transform; inner group = fit-to-view normalization.
  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      <group position={[offset.x, offset.y, offset.z]} scale={scale}>
        <primitive object={root} />
      </group>
    </group>
  )
}
