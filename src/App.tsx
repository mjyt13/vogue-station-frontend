import { useState } from 'react'
import tshirtUrl from './assets/tshirt.glb?url'
import { Viewer } from './features/viewer'
import type { GarmentMaterial } from './features/viewer'
import { INITIAL_MATERIAL, Wardrobe } from './features/wardrobe'

// App composes the features: the wardrobe produces a GarmentMaterial, the viewer
// renders it. The material selection lives here, between the two.
function App() {
  const [material, setMaterial] = useState<GarmentMaterial>(INITIAL_MATERIAL)
  const patchMaterial = (patch: Partial<GarmentMaterial>) =>
    setMaterial((prev) => ({ ...prev, ...patch }))

  return (
    <>
      <h1>Vogue Station — viewer</h1>
      <Viewer
        modelUrl={tshirtUrl}
        material={material}
        controls={<Wardrobe material={material} onChange={patchMaterial} />}
      />
    </>
  )
}

export default App
