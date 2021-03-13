import React from 'react'

import buttonStyle from './btn.module.css'

type ButtonProps = {
  className?: string
  children: any
  onClick?: any
  isPrimary?: boolean
}
type ButtonComponent = (arg0: ButtonProps) => any

const Button: ButtonComponent = ({
  className = '',
  children,
  onClick = undefined,
  isPrimary = false,
}) => (
  <button
    className={`${buttonStyle.btn} ${
      isPrimary ? buttonStyle.primary : buttonStyle.secondary
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
)

export default Button
