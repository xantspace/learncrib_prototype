import React from 'react'

export default function Skeleton({ className = '', rounded = '2xl' }) {
  return (
    <div
      className={`
        bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100
        bg-[length:800px_100%] animate-shimmer
        rounded-${rounded}
        ${className}
      `}
    />
  )
}

export function TutorCardSkeleton() {
  return (
    <div className="bg-white/70 border border-white/45 rounded-2xl p-4 flex items-center gap-4">
      <Skeleton className="w-14 h-14 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
