import { Viewer } from './features/viewer'
import tshirtUrl from './assets/tshirt.glb?url'

function App() {
  return (
    <>
      <h1>Vogue Station — viewer</h1>
      <Viewer modelUrl={tshirtUrl} />
    </>
  )
}

export default App
