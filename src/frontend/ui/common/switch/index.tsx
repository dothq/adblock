import React from 'react'

import switchStyle from './switch.module.css'

export const Switch = ({
  state,
  checkedColour,
  onChange,
}: {
  state: boolean
  checkedColour: string
  onChange: any
}) => {
  const onSChange = () => {
    onChange(state)
  }

  return (
    <div className={switchStyle.parent} onClick={() => onSChange()}>
      <i
        style={{ backgroundColor: state ? checkedColour : '' }}
        className={`${switchStyle.switchCircle} ${
          state == true ? switchStyle.switchCircleChecked : ''
        }`}
      ></i>
    </div>
  )
}
