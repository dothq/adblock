import React from 'react'

import style from './favicon.module.css'

const Favicon = ({ icon }: { icon: string }): JSX.Element => {
  return (
    <div className={style.favicon}>
      <i style={{ backgroundImage: `url(${icon})` }}></i>
    </div>
  )
}

export default Favicon
