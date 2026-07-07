import { type MouseEventHandler} from 'react'

export const Controls = (props: {name: string, coord: number, onClickPlus: MouseEventHandler, onClickMinus: MouseEventHandler })=> {
  return(
    <div className='switcher'>
      {props.name} = {props.coord}
      <button onClick={props.onClickPlus}>+</button>
      <button onClick={props.onClickMinus}>-</button>
    </div>
  )
}