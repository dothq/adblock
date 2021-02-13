import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const Checkbox = ({ className = '', children, value, onChange }) => {
  const [uuid, _] = useState(uuidv4())

  return (
    <div>
      <input type="checkbox" id={uuid} checked={value} onChange={onChange} />
      <label htmlFor={uuid}>{children}</label>
    </div>
  )
}

export default Checkbox
