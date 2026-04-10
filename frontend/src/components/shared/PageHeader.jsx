import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PageHeader({ title, subtitle, back = true, right }) {
  const navigate = useNavigate()
  return (
    <div className="px-5 pt-12 pb-4 flex items-center gap-3">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-2xl bg-white/80 border border-secondary/10 flex items-center justify-center flex-shrink-0 transition-all hover:border-primary/30"
        >
          <ArrowLeft size={16} className="text-secondary/60" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="font-outfit font-bold text-2xl text-secondary leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="font-inter text-sm text-secondary/50 mt-0.5">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
