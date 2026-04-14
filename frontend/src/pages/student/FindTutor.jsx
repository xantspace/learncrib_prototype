import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Star, MapPin, BadgeCheck, ChevronRight, RotateCcw, Zap } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import { useAuthStore } from '@/store/authStore'
import { useVerificationStore } from '@/store/verificationStore'
import { useMatchingStore, MATCH_STATUS } from '@/store/matchingStore'
import { findCandidates, dispatchRequest, buildMatchedSession, MATCH_TIMEOUT_MS } from '@/utils/tutorMatching'
import { usersAPI } from '@/services/api'

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Further Maths', 'Economics', 'Coding',
  'Literature', 'Commerce', 'Government', 'Design',
]

export default function FindTutor() {
  const navigate   = useNavigate()
  const { user }   = useAuthStore()
  const vStore     = useVerificationStore()
  const matching   = useMatchingStore()

  const [subject,    setSubject]    = useState('')
  const [customSub,  setCustomSub]  = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [userCoords, setUserCoords] = useState(null)

  const abortRef   = useRef(null)
  const timerRef   = useRef(null)

  // Get location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p  => setUserCoords([p.coords.latitude, p.coords.longitude]),
      () => setUserCoords([6.5244, 3.3792]),
      { timeout: 5000 }
    )
    // Reset any leftover state from a previous search
    matching.reset()
  }, [])

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current)
    abortRef.current?.abort()
  }, [])

  const activeSubject = showCustom ? customSub.trim() : subject

  const startSearch = async () => {
    if (!activeSubject) return

    // Load tutors — try API, fall back to mock
    let rawTutors = []
    try {
      const res = await usersAPI.getTutors({ q: activeSubject })
      rawTutors = Array.isArray(res.data) ? res.data : res.data?.results || []
    } catch {
      rawTutors = []
    }

    const candidates = findCandidates(activeSubject, rawTutors, {
      studentLat: userCoords?.[0],
      studentLng: userCoords?.[1],
      verificationStore: vStore,
    })

    if (!candidates.length) {
      matching.startSearch({ subject: activeSubject, candidates: [] })
      matching.timeout()
      return
    }

    // Start the store state
    matching.startSearch({ subject: activeSubject, candidates })

    // Tick countdown every second
    timerRef.current = setInterval(() => {
      matching.tickTimer()
    }, 1000)

    // Dispatch
    abortRef.current = new AbortController()
    dispatchRequest(candidates, {
      signal: abortRef.current.signal,
      onCandidateNotified: () => matching.incrementNotified(),
    })
      .then(tutor => {
        clearInterval(timerRef.current)
        matching.found(tutor)
      })
      .catch(err => {
        clearInterval(timerRef.current)
        if (err.message === 'TIMEOUT') matching.timeout()
        // CANCELLED is silent — user pressed cancel
      })
  }

  const handleCancel = () => {
    abortRef.current?.abort()
    clearInterval(timerRef.current)
    matching.cancel()
    matching.reset()
  }

  const handleBook = () => {
    const tutor = matching.matchedTutor
    if (!tutor) return
    matching.reset()
    navigate(`/student/book/${tutor.id}`)
  }

  const handleRetry = () => {
    matching.reset()
    // brief tick so state clears before re-triggering
    setTimeout(startSearch, 50)
  }

  // ── Render phases ──────────────────────────────────────────────────────────

  if (matching.status === MATCH_STATUS.SEARCHING) {
    return <SearchingView matching={matching} onCancel={handleCancel} />
  }

  if (matching.status === MATCH_STATUS.FOUND) {
    return <FoundView tutor={matching.matchedTutor} subject={matching.subject} onBook={handleBook} onCancel={() => { matching.reset() }} />
  }

  if (matching.status === MATCH_STATUS.TIMEOUT) {
    return <TimeoutView subject={matching.subject} onRetry={handleRetry} onBack={() => { matching.reset(); navigate(-1) }} />
  }

  // ── Idle — subject selection ───────────────────────────────────────────────
  return (
    <div className="pb-32">
      <PageHeader title="Find a Tutor" subtitle="Get matched instantly" />

      <div className="px-5">
        {/* Hero */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
            <Zap size={28} className="text-white" />
          </div>
          <h2 className="font-outfit font-bold text-xl text-secondary">Instant Matching</h2>
          <p className="font-inter text-sm text-secondary/55 mt-1 max-w-[260px] mx-auto">
            Tell us what you need and we'll find the best available tutor in seconds.
          </p>
        </div>

        {/* Subject chips */}
        <p className="font-outfit font-semibold text-sm text-secondary mb-3">What subject do you need?</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SUBJECTS.map(s => (
            <button
              key={s}
              onClick={() => { setSubject(s); setShowCustom(false) }}
              className={`py-2.5 px-2 rounded-xl text-xs font-inter font-medium transition-all border-2 ${
                subject === s && !showCustom
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-secondary/65 border-gray-150 hover:border-primary/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Custom subject */}
        <button
          onClick={() => { setShowCustom(v => !v); setSubject('') }}
          className={`w-full py-2.5 rounded-xl text-xs font-inter font-semibold border-2 transition-all mb-5 ${
            showCustom ? 'border-primary text-primary bg-primary-light' : 'border-dashed border-gray-300 text-secondary/50'
          }`}
        >
          {showCustom ? '✕ Close custom' : '+ Enter custom subject'}
        </button>

        {showCustom && (
          <div className="relative mb-5 animate-slide-up">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
            <input
              autoFocus
              type="text"
              placeholder="e.g. A-Level Biology, JAMB Maths…"
              value={customSub}
              onChange={e => setCustomSub(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && activeSubject && startSearch()}
              className="w-full pl-10 pr-4 py-3 border border-secondary/15 rounded-2xl font-inter text-sm bg-white outline-none focus:border-primary"
            />
          </div>
        )}

        {/* How it works */}
        <GlassCard className="p-4 mb-6" hover={false}>
          <p className="font-outfit font-semibold text-xs text-secondary/50 uppercase tracking-widest mb-3">How it works</p>
          <div className="flex flex-col gap-2.5">
            {[
              { n: '1', text: 'We find the top available tutors for your subject' },
              { n: '2', text: 'Requests are sent simultaneously — first to accept wins' },
              { n: '3', text: 'You\'re connected and can book instantly' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary-light text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {n}
                </span>
                <p className="font-inter text-xs text-secondary/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 z-50"
        style={{ background: 'linear-gradient(to top, white 80%, transparent)' }}>
        <Button
          size="full"
          onClick={startSearch}
          disabled={!activeSubject}
          className={!activeSubject ? 'opacity-40' : ''}
        >
          <Zap size={16} /> Find Tutor Now
        </Button>
        {activeSubject && (
          <p className="text-center font-inter text-xs text-secondary/40 mt-2">
            Searching for <strong className="text-secondary">{activeSubject}</strong> tutors near you
          </p>
        )}
      </div>
    </div>
  )
}

// ── Searching phase ────────────────────────────────────────────────────────────
function SearchingView({ matching, onCancel }) {
  const { candidates, notifiedCount, secondsLeft, subject } = matching

  const circumference = 2 * Math.PI * 26   // r=26
  const progress = secondsLeft / 60
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center bg-white">
      {/* Countdown ring */}
      <div className="relative w-24 h-24 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#EEF2FF" strokeWidth="4" />
          <circle
            cx="30" cy="30" r="26" fill="none"
            stroke="#1939D4" strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-outfit font-bold text-2xl text-secondary">{secondsLeft}</span>
          <span className="font-inter text-[10px] text-secondary/40">sec</span>
        </div>
      </div>

      <h2 className="font-outfit font-bold text-xl text-secondary mb-1">Finding Your Tutor</h2>
      <p className="font-inter text-sm text-secondary/55 mb-6 max-w-[260px]">
        Contacting the best available <strong>{subject}</strong> tutors near you…
      </p>

      {/* Candidate cards (shimmer until notified) */}
      <div className="w-full max-w-sm flex flex-col gap-2.5 mb-8">
        {candidates.map((tutor, i) => {
          const notified = i < notifiedCount
          const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()
          return (
            <div
              key={tutor.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-500 ${
                notified
                  ? 'bg-white border-primary/20 shadow-sm'
                  : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-outfit font-bold text-white text-xs flex-shrink-0"
                style={{ background: notified ? 'linear-gradient(135deg,#1939D4,#0F2391)' : '#D1D5DB' }}>
                {initials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className={`font-outfit font-semibold text-sm ${notified ? 'text-secondary' : 'text-secondary/30'}`}>
                  {tutor.first_name} {tutor.last_name}
                </p>
                <p className={`font-inter text-xs ${notified ? 'text-secondary/50' : 'text-secondary/25'}`}>
                  {(tutor.subjects || []).slice(0, 2).join(' · ')}
                </p>
              </div>
              {notified && (
                <span className="text-[10px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full flex-shrink-0 animate-pulse">
                  Notified
                </span>
              )}
            </div>
          )
        })}
        {candidates.length === 0 && (
          <p className="font-inter text-sm text-secondary/40 py-6">Looking for tutors…</p>
        )}
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-1.5 font-inter text-sm text-secondary/40 hover:text-secondary transition-colors"
      >
        <X size={14} /> Cancel search
      </button>
    </div>
  )
}

// ── Found phase ────────────────────────────────────────────────────────────────
function FoundView({ tutor, subject, onBook, onCancel }) {
  const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()
  const isVerified = tutor._verificationStatus === 'APPROVED' || tutor.verification_status === 'APPROVED'

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center bg-white">
      {/* Success pulse */}
      <div className="relative mb-6 animate-slide-up">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center font-outfit font-bold text-white text-3xl shadow-glow"
          style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
          {initials}
        </div>
        <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </span>
      </div>

      <div className="mb-1 animate-slide-up">
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Tutor Found!
        </div>
      </div>

      <h2 className="font-outfit font-bold text-2xl text-secondary animate-slide-up">
        {tutor.first_name} {tutor.last_name}
      </h2>

      {isVerified && (
        <div className="flex items-center gap-1.5 justify-center mt-1 animate-slide-up">
          <BadgeCheck size={15} className="text-primary" />
          <span className="font-inter text-xs font-semibold text-primary">Verified Tutor</span>
        </div>
      )}

      <p className="font-inter text-sm text-secondary/55 mt-1 animate-slide-up">
        Available for <strong>{subject}</strong>
      </p>

      {/* Stats card */}
      <GlassCard className="p-5 w-full max-w-sm mt-5 mb-6 animate-slide-up" hover={false}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <StatBlock
            value={`₦${Number(tutor.hourly_rate).toLocaleString()}`}
            label="Per Hour"
          />
          <StatBlock
            value={parseFloat(tutor.rating) > 0 ? tutor.rating : '—'}
            label="Rating"
            icon={parseFloat(tutor.rating) > 0 ? <Star size={10} className="text-accent fill-current" /> : null}
          />
          <StatBlock
            value={tutor.distance_km != null ? `${parseFloat(tutor.distance_km).toFixed(1)} km` : 'Near'}
            label="Away"
            icon={<MapPin size={10} className="text-secondary/40" />}
          />
        </div>

        {(tutor.subjects || []).length > 0 && (
          <div className="mt-3 pt-3 border-t border-secondary/10 flex flex-wrap gap-1.5 justify-center">
            {(tutor.subjects || []).slice(0, 4).map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 text-secondary/60 text-[10px] font-medium">{s}</span>
            ))}
          </div>
        )}

        {tutor._score != null && (
          <div className="mt-3 pt-3 border-t border-secondary/10">
            <div className="flex items-center justify-between mb-1">
              <span className="font-inter text-[10px] text-secondary/40 uppercase tracking-wider">Match Score</span>
              <span className="font-inter text-xs font-bold text-primary">{tutor._score}/100</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${tutor._score}%` }} />
            </div>
          </div>
        )}
      </GlassCard>

      <div className="w-full max-w-sm flex flex-col gap-3 animate-slide-up">
        <Button size="full" onClick={onBook}>
          Book Session <ChevronRight size={16} />
        </Button>
        <Button variant="ghost" size="full" onClick={onCancel}>
          Search Again
        </Button>
      </div>
    </div>
  )
}

// ── Timeout phase ──────────────────────────────────────────────────────────────
function TimeoutView({ subject, onRetry, onBack }) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center bg-white">
      <div className="w-20 h-20 rounded-3xl bg-yellow-50 flex items-center justify-center mb-5">
        <RotateCcw size={32} className="text-yellow-500" />
      </div>
      <h2 className="font-outfit font-bold text-xl text-secondary mb-2">No Tutor Available</h2>
      <p className="font-inter text-sm text-secondary/55 max-w-[260px] mb-2">
        No <strong>{subject}</strong> tutor accepted within 60 seconds.
      </p>
      <p className="font-inter text-xs text-secondary/40 mb-8">
        Try again — a tutor may become available shortly, or browse all tutors.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <Button size="full" onClick={onRetry}>
          <RotateCcw size={15} /> Try Again
        </Button>
        <Button variant="ghost" size="full" onClick={onBack}>
          Browse Tutors Instead
        </Button>
      </div>
    </div>
  )
}

function StatBlock({ value, label, icon }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-0.5">
        {icon}
        <p className="font-outfit font-bold text-sm text-secondary">{value}</p>
      </div>
      <p className="font-inter text-[10px] text-secondary/40">{label}</p>
    </div>
  )
}
