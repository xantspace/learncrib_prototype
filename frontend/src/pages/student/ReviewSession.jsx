import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { reviewsAPI, sessionsAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export default function ReviewSession() {
  const { sessionId } = useParams()
  const navigate      = useNavigate()
  const { showToast } = useUIStore()

  const [session,    setSession]    = useState(null)
  const [rating,     setRating]     = useState(0)
  const [hover,      setHover]      = useState(0)
  const [comment,    setComment]    = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    sessionsAPI.getById(sessionId)
      .then(r => setSession(r.data))
      .catch(() => {})
  }, [sessionId])

  const tutorName = session
    ? `${session.tutor_first_name || ''} ${session.tutor_last_name || ''}`.trim() || 'your tutor'
    : 'your tutor'

  const handleSubmit = async () => {
    if (rating === 0) { showToast('Please select a star rating', 'error'); return }
    setSubmitting(true)
    try {
      await reviewsAPI.submit(sessionId, { rating, comment: comment.trim() })
      showToast('Review submitted — thank you!', 'success')
      navigate('/student/sessions', { replace: true })
    } catch {
      showToast('Could not submit review. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const active = hover || rating

  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 60%, hsl(220,40%,97%) 100%)' }}
    >
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <div className="text-5xl mb-4">⭐</div>
        <h1 className="font-outfit font-bold text-2xl text-secondary mb-2">Rate Your Session</h1>
        <p className="font-inter text-sm text-secondary/60 max-w-[260px]">
          How was your session with <span className="font-semibold text-secondary">{tutorName}</span>?
        </p>
      </div>

      {/* Rating card */}
      <GlassCard className="p-6 w-full max-w-sm mb-6 animate-slide-up" hover={false}>
        {/* Stars */}
        <div className="flex justify-center gap-3 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={40}
                strokeWidth={1.5}
                className={`transition-colors duration-150 ${
                  active >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Rating label */}
        <div className="h-6 flex items-center justify-center mb-4">
          {active > 0 && (
            <p className="font-outfit font-semibold text-sm text-secondary">{LABELS[active]}</p>
          )}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Tell others about your experience (optional)…"
          rows={4}
          maxLength={500}
          className="w-full border border-secondary/15 rounded-2xl px-4 py-3 font-inter text-sm text-secondary bg-white/80 outline-none focus:border-primary resize-none placeholder:text-secondary/40"
        />
        <p className="font-inter text-[0.65rem] text-secondary/35 text-right mt-1">{comment.length}/500</p>
      </GlassCard>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm animate-slide-up">
        <Button size="full" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Review'}
        </Button>
        <Button variant="ghost" size="full" onClick={() => navigate('/student/sessions', { replace: true })}>
          Skip for Now
        </Button>
      </div>
    </div>
  )
}
