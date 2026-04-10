import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, Calendar, MessageCircle, Home } from 'lucide-react'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { sessionsAPI } from '@/services/api'

export default function BookingConfirmation() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)

  useEffect(() => {
    sessionsAPI.getById(sessionId)
      .then(r => setSession(r.data))
      .catch(() => {})
  }, [sessionId])

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 50%, hsl(220,40%,97%) 100%)' }}>

      {/* Success animation */}
      <div className="mb-8 animate-slide-up">
        <div className="w-28 h-28 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5 shadow-glow">
          <CheckCircle size={56} className="text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="font-outfit font-bold text-3xl text-secondary mb-2">Booking Confirmed!</h1>
        <p className="font-inter text-sm text-secondary/60 max-w-[280px]">
          Your payment is held securely in escrow until your session is completed.
        </p>
      </div>

      {/* Session details */}
      {session && (
        <GlassCard className="p-5 w-full max-w-sm mb-8 text-left animate-slide-up" style={{ animationDelay: '0.2s' }} hover={false}>
          <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-3">Session Details</p>
          <div className="flex flex-col gap-2 font-inter text-sm">
            <Row label="Subject"    value={session.subject} />
            <Row label="Date"       value={session.scheduled_at ? new Date(session.scheduled_at).toLocaleString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' }) : '—'} />
            <Row label="Time"       value={session.scheduled_at ? new Date(session.scheduled_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }) : '—'} />
            <Row label="Status"     value={<span className="text-primary font-semibold">Awaiting tutor confirmation</span>} />
          </div>

          {/* Escrow note */}
          <div className="mt-4 pt-4 border-t border-secondary/10">
            <p className="font-inter text-xs text-secondary/50">
              💰 Funds are in escrow. Released to tutor 48 hours after session completion.
            </p>
          </div>
        </GlassCard>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <Button size="full" onClick={() => navigate('/messages')}>
          <MessageCircle size={16} /> Message Tutor
        </Button>
        <Button variant="ghost" size="full" onClick={() => navigate('/student/sessions')}>
          <Calendar size={16} /> View My Sessions
        </Button>
        <button onClick={() => navigate('/student/dashboard')} className="font-inter text-sm text-secondary/50 flex items-center justify-center gap-1 mt-1">
          <Home size={14} /> Back to Home
        </button>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-secondary/60">{label}</span>
      <span className="font-medium text-secondary">{value}</span>
    </div>
  )
}
