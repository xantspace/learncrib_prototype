import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MapPin, ChevronRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

function Avatar({ name, gradient, size = 14 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  return (
    <div
      className={`w-${size} h-${size} rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg flex-shrink-0`}
      style={{ background: gradient || 'linear-gradient(135deg, #1939D4, #0F2391)' }}
    >
      {initials}
    </div>
  )
}

export default function TutorCard({ tutor }) {
  const navigate = useNavigate()
  const {
    id, first_name, last_name, subjects = [], hourly_rate,
    rating, total_reviews, distance_km, is_available,
  } = tutor

  const name = `${first_name} ${last_name}`
  const subjectStr = Array.isArray(subjects)
    ? subjects.slice(0, 2).join(' · ')
    : subjects

  return (
    <GlassCard
      className="p-4 flex items-center gap-4"
      onClick={() => navigate(`/student/tutor/${id}`)}
    >
      <div className="relative flex-shrink-0">
        <Avatar name={name} gradient={tutor.avatar_gradient} />
        {is_available && (
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white animate-pulse-ring" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-outfit font-semibold text-base text-secondary leading-tight truncate">{name}</h3>
            <p className="font-inter text-xs text-secondary/50 mt-0.5">{subjectStr}</p>
          </div>
          <span className="font-outfit font-bold text-sm text-primary whitespace-nowrap ml-2">
            ₦{Number(hourly_rate).toLocaleString()}
            <span className="font-inter font-normal text-xs text-secondary/40">/hr</span>
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-accent fill-current" />
            <span className="font-inter text-xs font-semibold">{rating || '–'}</span>
            {total_reviews > 0 && (
              <span className="text-xs text-secondary/40">({total_reviews})</span>
            )}
          </div>
          {distance_km != null && (
            <div className="flex items-center gap-1 text-secondary/40">
              <MapPin size={11} />
              <span className="text-xs">{distance_km.toFixed(1)} km away</span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight size={16} className="text-secondary/30 flex-shrink-0" />
    </GlassCard>
  )
}
