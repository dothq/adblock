import React from 'react'

type ButtonProps = { className?: string; children: any; onClick?: any }
type ButtonComponent = (arg0: ButtonProps) => any

const Button: ButtonComponent = ({
  className = '',
  children,
  onClick = undefined,
}) => (
  <button className={`browser-style ${className}`} onClick={onClick}>
    {children}
  </button>
)

export default Button
