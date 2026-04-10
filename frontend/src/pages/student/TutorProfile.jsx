import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star, MapPin, BookOpen, MessageCircle, Calendar } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/shared/PageHeader'
import { usersAPI } from '@/services/api'

export default function TutorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersAPI.getTutorById(id)
      .then(r => setTutor(r.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-svh">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!tutor) return (
    <div className="flex flex-col items-center justify-center h-svh gap-3">
      <p className="font-outfit font-semibold text-secondary">Tutor not found</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>Go back</Button>
    </div>
  )

  const name = `${tutor.first_name} ${tutor.last_name}`
  const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()

  return (
    <div className="pb-32">
      <PageHeader />

      {/* Hero */}
      <div className="px-5 pb-5 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center font-outfit font-bold text-white text-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
            {initials}
          </div>
          {tutor.is_available && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-white" />
          )}
        </div>
        <h1 className="font-outfit font-bold text-2xl text-secondary">{name}</h1>
        {tutor.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={14} className={`${i <= Math.round(tutor.rating) ? 'text-accent fill-current' : 'text-gray-300'}`} />
            ))}
            <span className="font-inter text-sm font-semibold ml-1">{tutor.rating}</span>
            <span className="font-inter text-xs text-secondary/40">({tutor.total_reviews} reviews)</span>
          </div>
        )}
        {tutor.distance_km != null && (
          <div className="flex items-center gap-1 mt-2 text-secondary/50">
            <MapPin size={13} />
            <span className="font-inter text-sm">{tutor.distance_km.toFixed(1)} km away</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-center mt-3">
          {(tutor.subjects || []).map(s => (
            <Badge key={s} variant="light">{s}</Badge>
          ))}
        </div>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {/* Rate card */}
        <GlassCard className="p-4 flex items-center justify-between" hover={false}>
          <div>
            <p className="font-inter text-xs text-secondary/50">Hourly Rate</p>
            <p className="font-outfit font-bold text-2xl text-primary">₦{Number(tutor.hourly_rate).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-inter text-xs text-secondary/50">Verified</p>
            <p className="font-inter text-sm font-semibold text-success">{tutor.verification_status === 'APPROVED' ? '✓ Yes' : 'Pending'}</p>
          </div>
        </GlassCard>

        {/* Bio */}
        {tutor.bio && (
          <div>
            <h3 className="font-outfit font-semibold text-sm text-secondary mb-2 flex items-center gap-2">
              <BookOpen size={14} className="text-primary" /> About
            </h3>
            <p className="font-inter text-sm text-secondary/70 leading-relaxed">{tutor.bio}</p>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 z-50"
        style={{ background: 'linear-gradient(to top, white 75%, transparent)' }}>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" className="flex-1" onClick={() => navigate('/messages')}>
            <MessageCircle size={16} /> Message
          </Button>
          <Button size="md" className="flex-1" onClick={() => navigate(`/student/book/${id}`)}>
            <Calendar size={16} /> Book Session
          </Button>
        </div>
      </div>
    </div>
  )
}
