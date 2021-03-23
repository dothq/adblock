import React, { HTMLAttributes } from 'react'

import buttonStyle from './btn.module.css'

type ButtonProps = {
  className?: string
  children: any
  onClick?: any
  isPrimary?: boolean
  style?: object
}
type ButtonComponent = (arg0: ButtonProps) => any

const Button: ButtonComponent = ({
  className = '',
  children,
  onClick = undefined,
  isPrimary = false,
  style = {},
}) => (
  <button
    className={`${buttonStyle.btn} ${
      isPrimary ? buttonStyle.primary : buttonStyle.secondary
    } ${className}`}
    onClick={onClick}
    style={style}
  >
    {children}
  </button>
)

export default Button
