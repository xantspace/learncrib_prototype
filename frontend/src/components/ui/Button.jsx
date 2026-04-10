import React from 'react'

const variants = {
  primary: `
    bg-primary text-white rounded-full font-outfit font-semibold text-base
    border-none cursor-pointer inline-flex items-center gap-2
    transition-all duration-200
    hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
  `,
  ghost: `
    bg-transparent text-secondary rounded-full font-outfit font-medium text-sm
    border border-secondary/20 cursor-pointer inline-flex items-center gap-1.5
    transition-all duration-200
    hover:border-primary hover:text-primary active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-red-500 text-white rounded-full font-outfit font-semibold text-base
    border-none cursor-pointer inline-flex items-center gap-2
    transition-all duration-200
    hover:bg-red-600 active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
}

const sizes = {
  sm:  'px-4 py-2 text-sm',
  md:  'px-8 py-3',
  lg:  'px-8 py-4 text-lg',
  full:'px-8 py-3 w-full justify-center',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  ...props
}) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}
