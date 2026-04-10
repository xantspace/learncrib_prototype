import React, { useEffect } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

const icons = {
  success: <CheckCircle size={16} className="text-success" />,
  error:   <XCircle size={16} className="text-red-500" />,
  info:    <Info size={16} className="text-primary" />,
}

export default function Toast() {
  const { toast, clearToast } = useUIStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, toast.duration || 3500)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999]
        bg-white/90 backdrop-blur-glass border border-white/50
        rounded-2xl px-4 py-3 shadow-glass
        flex items-center gap-3 min-w-[260px] max-w-[360px]
        animate-slide-up
      `}
    >
      {icons[toast.type] || icons.info}
      <p className="font-inter text-sm text-secondary flex-1">{toast.message}</p>
      <button onClick={clearToast} className="text-secondary/40 hover:text-secondary/70 transition-colors">
        <X size={14} />
      </button>
    </div>
  )
}
