import React from 'react'

export default function GlassCard({ children, className = '', hover = true, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/70 backdrop-blur-glass border border-white/45 rounded-2xl
        shadow-glass
        ${hover ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
