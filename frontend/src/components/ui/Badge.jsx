import React from 'react'

const variants = {
  primary: 'bg-primary text-white',
  navy:    'bg-secondary text-white',
  accent:  'bg-accent text-secondary',
  success: 'bg-success text-white',
  light:   'bg-primary-light text-primary',
  gray:    'bg-gray-100 text-secondary/60',
}

export default function Badge({ variant = 'primary', children, className = '' }) {
  return (
    <span
      className={`
        inline-block px-2.5 py-1 rounded-full text-[0.72rem] font-semibold font-inter
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
