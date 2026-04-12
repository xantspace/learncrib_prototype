import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, SlidersHorizontal, MapPin, Star, ChevronRight, Video, MessageCircle, CalendarDays, Map, Zap } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import { TutorCardSkeleton } from '@/components/ui/Skeleton'
import { usersAPI, sessionsAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const FILTER_CHIPS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Coding']

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tutors, setTutors]   = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    Promise.all([
      usersAPI.getNearbyTutors({ limit: 5 }).catch(() => ({ data: [] })),
      sessionsAPI.list().catch(() => ({ data: [] })),
    ]).then(([tRes, sRes]) => {
      setTutors(Array.isArray(tRes.data) ? tRes.data : tRes.data?.results || [])
      const upcoming = (Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || [])
        .find(s => ['ACCEPTED', 'SCHEDULED'].includes(s.status))
      setSession(upcoming || null)
    }).finally(() => setLoading(false))
  }, [])

  const filteredTutors = activeFilter === 'All'
    ? tutors
    : tutors.filter(t => t.subjects?.includes(activeFilter))

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="pb-2">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 px-5 pt-10 pb-4 sticky-header-fade">
        <div className="flex items-center justify-between mb-4">
          <img src="/assets/img/logo_b.png" alt="LearnCrib" className="h-6 object-contain logo-adaptive" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-inter text-xs text-secondary/50">{greeting()}</p>
            <h1 className="font-outfit font-bold text-xl text-secondary">
              Hello, {user?.first_name || 'there'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-gray-100 border border-secondary/10 flex items-center justify-center">
              <Bell size={18} className="text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-sm">
              {initials || 'ME'}
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div
          onClick={() => navigate('/student/search')}
          className="relative cursor-pointer"
        >
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45 pointer-events-none" />
          <div className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary/40 flex items-center justify-between">
            <span>Search subjects or tutors…</span>
            <SlidersHorizontal size={16} className="text-primary" />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium font-inter transition-all ${
                activeFilter === chip
                  ? 'bg-primary text-white'
                  : 'bg-secondary/10 text-secondary hover:bg-secondary/20'
              }`}
            >
              {activeFilter === chip && <span>✓</span>} {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 mt-2">

        {/* Instant Match CTA */}
        <button
          onClick={() => navigate('/student/find')}
          className="w-full flex items-center gap-4 mb-3 rounded-3xl p-4 text-left"
          style={{ background: 'linear-gradient(135deg, #1939D4 0%, #0F2391 100%)' }}
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Zap size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-outfit font-semibold text-sm text-white">Find a Tutor Now</p>
            <p className="font-inter text-xs text-white/60">Instant matching — connected in seconds</p>
          </div>
          <ChevronRight size={16} className="text-white/50" />
        </button>

        {/* Map CTA */}
        <GlassCard
          onClick={() => navigate('/student/map')}
          className="p-4 flex items-center gap-4 mb-5 border border-primary/20 bg-primary-light/50"
          hover={false}
        >
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Map size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-outfit font-semibold text-sm text-secondary">Find tutors near you</p>
            <p className="font-inter text-xs text-secondary/50">See tutors on a live map</p>
          </div>
          <ChevronRight size={16} className="text-secondary/30" />
        </GlassCard>

        {/* Tutors Near You */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-outfit font-bold text-lg text-secondary">Tutors Near You</h2>
          <button onClick={() => navigate('/student/search')} className="text-xs font-inter font-medium text-primary">See all</button>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {loading
            ? [1,2,3].map(i => <TutorCardSkeleton key={i} />)
            : filteredTutors.length > 0
              ? filteredTutors.map(tutor => <TutorCard key={tutor.id} tutor={tutor} />)
              : <EmptyTutors onSearch={() => navigate('/student/search')} />
          }
        </div>

        {/* Upcoming Session */}
        {session && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-outfit font-bold text-lg text-secondary">Upcoming Session</h2>
              <button onClick={() => navigate('/student/sessions')} className="text-xs font-inter font-medium text-primary">View all</button>
            </div>
            <SessionCard session={session} />
          </>
        )}

        {/* Recommended Tutors (horizontal scroll) */}
        {tutors.length > 3 && (
          <>
            <div className="flex items-center justify-between mb-3 mt-6">
              <h2 className="font-outfit font-bold text-lg text-secondary">Recommended for You</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {tutors.slice(3).map(tutor => (
                <MiniTutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

function TutorCard({ tutor }) {
  const navigate = useNavigate()
  const name = `${tutor.first_name} ${tutor.last_name}`
  const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()
  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects.slice(0, 2).join(' · ') : ''

  return (
    <GlassCard className="p-4 flex items-center gap-4" onClick={() => navigate(`/student/tutor/${tutor.id}`)}>
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
          {initials}
        </div>
        {tutor.is_available && (
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white animate-pulse-ring" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-outfit font-semibold text-base text-secondary leading-tight">{name}</h3>
            <p className="font-inter text-xs text-secondary/50 mt-0.5">{subjects}</p>
          </div>
          <span className="font-outfit font-bold text-sm text-primary whitespace-nowrap ml-2">
            ₦{Number(tutor.hourly_rate || 0).toLocaleString()}
            <span className="font-inter font-normal text-xs text-secondary/40">/hr</span>
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {tutor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={13} className="text-accent fill-current" />
              <span className="font-inter text-xs font-semibold">{tutor.rating}</span>
              {tutor.total_reviews > 0 && <span className="text-xs text-secondary/40">({tutor.total_reviews})</span>}
            </div>
          )}
          {tutor.distance_km != null && (
            <div className="flex items-center gap-1 text-secondary/40">
              <MapPin size={11} /><span className="text-xs">{tutor.distance_km.toFixed(1)} km away</span>
            </div>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-secondary/30 flex-shrink-0" />
    </GlassCard>
  )
}

function MiniTutorCard({ tutor }) {
  const navigate = useNavigate()
  const name = `${tutor.first_name} ${tutor.last_name}`
  const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()
  return (
    <GlassCard className="p-4 flex-shrink-0 w-44 flex flex-col items-center text-center gap-2" onClick={() => navigate(`/student/tutor/${tutor.id}`)}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg"
        style={{ background: 'linear-gradient(135deg,hsl(270,60%,55%),hsl(270,40%,40%))' }}>
        {initials}
      </div>
      <h4 className="font-outfit font-semibold text-sm text-secondary">{name}</h4>
      <p className="text-xs font-inter text-secondary/50">{(tutor.subjects || [])[0] || 'Tutor'}</p>
      {tutor.rating > 0 && (
        <div className="flex items-center gap-1">
          <Star size={11} className="text-accent fill-current" />
          <span className="text-xs font-semibold">{tutor.rating}</span>
        </div>
      )}
      <span className="font-outfit font-bold text-sm text-primary">₦{Number(tutor.hourly_rate || 0).toLocaleString()}/hr</span>
    </GlassCard>
  )
}

function SessionCard({ session }) {
  const navigate = useNavigate()
  const tutorName = session.tutor_name || 'Your Tutor'
  const dateStr = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Scheduled'

  return (
    <GlassCard
      className="p-4 mb-6"
      hover={false}
      style={{ background: 'linear-gradient(135deg, #1939D4 0%, hsl(175,80%,25%) 100%)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-inter text-xs text-white/75">{dateStr}</p>
          <h3 className="font-outfit font-bold text-lg text-white mt-0.5">{session.subject}</h3>
          <p className="font-inter text-sm text-white/80">with {tutorName}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Video size={18} className="text-white" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => navigate('/messages')}
          className="flex-1 text-white text-xs font-inter font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 bg-white/20">
          <MessageCircle size={13} /> Chat
        </button>
        <button onClick={() => navigate(`/student/sessions`)}
          className="flex-1 bg-white text-xs font-outfit font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 text-primary">
          <CalendarDays size={13} /> Details
        </button>
      </div>
    </GlassCard>
  )
}

function EmptyTutors({ onSearch }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">🔍</div>
      <p className="font-outfit font-semibold text-secondary">No tutors found nearby</p>
      <p className="font-inter text-sm text-secondary/50 mt-1">Try expanding your search area</p>
      <button onClick={onSearch} className="mt-4 text-sm font-inter font-semibold text-primary">Browse all tutors →</button>
    </div>
  )
}
