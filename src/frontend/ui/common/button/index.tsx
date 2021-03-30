import React, { MouseEventHandler } from 'react'

import buttonStyle from './btn.module.css'

type ButtonProps = {
  className?: string
  children: JSX.Element
  onClick?: MouseEventHandler<HTMLButtonElement>
  isPrimary?: boolean
  style?: Record<string, unknown>
}
type ButtonComponent = (arg0: ButtonProps) => JSX.Element

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
