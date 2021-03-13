import { Check } from 'react-feather'
import { useState } from 'react'

import style from './checkbox.module.css'

const Checkbox = ({ children, value = false, onChange = () => {} }) => {
  const [contextMenu, setContextMenu] = useState(false)

  return (
    <label
      className={style.container}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenu(!contextMenu)
      }}
    >
      <input type="checkbox" checked={value} onChange={onChange} />
      <div>
        <div>
          <div>{children}</div>
        </div>
      </div>
      <span className={style.checkmark}>
        <Check size={10} className={!value ? style.hidden : style.show} />
      </span>
    </label>
  )
}

export default Checkbox
