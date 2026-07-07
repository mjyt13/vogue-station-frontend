import { Canvas, useFrame } from '@react-three/fiber'
import { useRef, useState, type MouseEventHandler} from 'react'
import { Controls } from './shared/controls'

type coords = {
  x: number,
  y: number,
  z: number
}

function MovingTshirt() {
  const groupRef = useRef<any>(null)

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.x = Math.sin(clock.elapsedTime) * 1.2
      // groupRef.current.position.y = Math.cos(clock.elapsedTime * 0.7) * 1.3
      // groupRef.current.rotation.z = clock.elapsedTime * 0.7
    }
  })

  return (
    <group ref={groupRef}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.7, 1.4, 0.25]} />
        <meshStandardMaterial color="tomato" />
      </mesh>
    </group>
  )
}

function App() {
  const [coordinates, setCoordinates] = useState<coords>({x:0,y:0,z:0})

  const updateXPlus = () => {
    setCoordinates(coordinates=>({...coordinates,x: coordinates.x+1}))
  }
  const updateXMinus = () => {
    setCoordinates(coordinates=>({...coordinates,x: coordinates.x-1}))
  }
  const updateYPlus = () => {
    setCoordinates(coordinates=>({...coordinates,y: coordinates.y+1}))
  }
  const updateYMinus = () => {
    setCoordinates(coordinates=>({...coordinates,y: coordinates.y-1}))
  }
  const updateZPlus = () => {
    setCoordinates(coordinates=>({...coordinates,z: coordinates.z+1}))
  }
  const updateZMinus = () => {
    setCoordinates(coordinates=>({...coordinates,z: coordinates.z-1}))
  }

  return (
    <>
      <h1>Canvas</h1>
      <div id='controls' style={{display:'flex',alignItems:'center',alignSelf:"center", paddingBottom:'1rem', backgroundColor:"aqua"}}>
        <Controls name='x' coord={coordinates.x} onClickPlus={updateXPlus} onClickMinus={updateXMinus}/>
        <Controls name='y' coord={coordinates.y} onClickPlus={updateYPlus} onClickMinus={updateYMinus}/>
        <Controls name='z' coord={coordinates.z} onClickPlus={updateZPlus} onClickMinus={updateZMinus}/>
      </div>
      <div id="canvas-container" style={{ width: '100%', height: '400px'}}>
        <Canvas camera={{ position: [coordinates.x, coordinates.y, coordinates.z], rotation: [0, 0, 0]}}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 3, 5]} intensity={1.2} />
          <MovingTshirt />
        </Canvas>
      </div>
    </>
  )
}

export default App