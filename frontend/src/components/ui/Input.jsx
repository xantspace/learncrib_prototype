import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  icon: Icon,
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) {
  const [showPwd, setShowPwd] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-inter font-semibold uppercase tracking-widest text-secondary/45">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45 pointer-events-none">
            <Icon size={16} />
          </span>
        )}
        <input
          type={inputType}
          className={`
            w-full py-3.5 pr-4 border border-secondary/15 rounded-2xl
            font-inter text-[0.95rem] bg-white/80 text-secondary outline-none
            transition-all duration-200
            focus:border-primary focus:shadow-[0_0_0_4px_#EEF2FF]
            placeholder:text-secondary/40
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/70 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs font-inter text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  )
}
