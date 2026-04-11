import React from 'react'
import { BadgeCheck } from 'lucide-react'

/**
 * VerifiedBadge — reusable across tutor cards, profiles, map markers
 * size: 'sm' | 'md' | 'lg'
 */
export default function VerifiedBadge({ size = 'md', className = '' }) {
  const styles = {
    sm: { icon: 12, px: 'px-1.5 py-0.5', text: 'text-[0.6rem]', gap: 'gap-0.5' },
    md: { icon: 13, px: 'px-2.5 py-1',   text: 'text-[0.7rem]', gap: 'gap-1'   },
    lg: { icon: 15, px: 'px-3 py-1.5',   text: 'text-xs',       gap: 'gap-1.5' },
  }
  const s = styles[size]
  return (
    <span className={`inline-flex items-center ${s.gap} ${s.px} rounded-full bg-primary text-white font-inter font-semibold ${s.text} ${className}`}>
      <BadgeCheck size={s.icon} className="fill-white text-primary" strokeWidth={2.5} />
      Verified
    </span>
  )
}
