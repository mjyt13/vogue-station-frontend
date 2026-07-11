import { useGLTF } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from 'three'
import { TARGET_SIZE } from './config'
import type { GarmentMaterial, Transform } from './types'

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

  // Load the pattern texture tolerantly: a broken or expired presigned URL falls
  // back to no map (color only) instead of throwing and crashing the Canvas.
  // Keyed by url so the "no pattern" case needs no synchronous setState.
  const [loaded, setLoaded] = useState<{ url: string; texture: Texture } | null>(null)
  useEffect(() => {
    if (!patternUrl) return
    let cancelled = false
    new TextureLoader().load(
      patternUrl,
      (texture) => {
        if (cancelled) return texture.dispose()
        texture.colorSpace = SRGBColorSpace
        texture.wrapS = texture.wrapT = RepeatWrapping
        texture.anisotropy = 16
        setLoaded({ url: patternUrl, texture })
      },
      undefined,
      () => {
        if (!cancelled) setLoaded(null) // broken/expired pattern → color only
      },
    )
    return () => {
      cancelled = true
    }
  }, [patternUrl])
  const texture = loaded && loaded.url === patternUrl ? loaded.texture : null

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
    // repeat is a sampler param applied per-frame — no re-upload (needsUpdate) needed.
    texture?.repeat.set(patternScale, patternScale)
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const mat = obj.material as MeshStandardMaterial
      if (material?.color) mat.color.set(material.color)
      mat.map = texture // null → color only; toggling a map recompiles the shader
      mat.needsUpdate = true
    })
  }, [root, material?.color, texture, patternScale])

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
