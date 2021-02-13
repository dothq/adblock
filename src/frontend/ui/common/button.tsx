import React from 'react'

const Button = ({ className = '', children }) => (
  <button className={`browser-style ${className}`}>{children}</button>
)

export default Button
