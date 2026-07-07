import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import { Box3, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TARGET_SIZE } from './config'
import type { Transform } from './types'

// A single GLB model placed under a user-driven transform. The model's native
// units/origin are unknown, so we normalize once on load: recenter it on the
// origin and scale it to TARGET_SIZE. Without this a mesh can load far
// off-camera or at a scale that makes it invisible.
export function Model({ url, transform }: { url: string; transform: Transform }) {
  const gltf = useLoader(GLTFLoader, url)
  const { position, rotation } = transform

  const { offset, scale } = useMemo(() => {
    const box = new Box3().setFromObject(gltf.scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = TARGET_SIZE / maxDim
    return { offset: center.multiplyScalar(-scale), scale }
  }, [gltf.scene])

  // Outer group = user transform; inner group = fit-to-view normalization.
  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
    >
      <group position={[offset.x, offset.y, offset.z]} scale={scale}>
        <primitive object={gltf.scene} />
      </group>
    </group>
  )
}
