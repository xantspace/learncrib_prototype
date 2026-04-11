import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, CheckCircle, XCircle, X } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'
import { sessionsAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const STATUS_META = {
  PENDING:    { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700',  icon: Clock },
  ACCEPTED:   { label: 'Accepted',         color: 'bg-blue-100 text-blue-700',      icon: Calendar },
  SCHEDULED:  { label: 'Scheduled',        color: 'bg-primary-light text-primary',  icon: Calendar },
  COMPLETED:  { label: 'Completed',        color: 'bg-green-100 text-green-700',    icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',        color: 'bg-red-100 text-red-500',        icon: XCircle },
  REJECTED:   { label: 'Rejected',         color: 'bg-red-100 text-red-500',        icon: XCircle },
}

const TABS = ['Upcoming', 'Completed', 'All']

export default function Sessions() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [sessions,    setSessions]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState('Upcoming')
  const [disputeId,   setDisputeId]   = useState(null)   // session id for dispute modal

  const load = () => {
    setLoading(true)
    sessionsAPI.list()
      .then(r => setSessions(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleConfirm = async (sessionId) => {
    try {
      await sessionsAPI.confirm(sessionId)
      showToast('Session confirmed!', 'success')
      navigate(`/student/review/${sessionId}`)
    } catch {
      showToast('Could not confirm session', 'error')
    }
  }

  const filtered = sessions.filter(s => {
    if (tab === 'Upcoming')  return ['PENDING','ACCEPTED','SCHEDULED'].includes(s.status)
    if (tab === 'Completed') return s.status === 'COMPLETED'
    return true
  })

  return (
    <div>
      <PageHeader title="My Sessions" back={false} />

      {/* Tabs */}
      <div className="px-5 flex gap-2 mb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-inter font-semibold transition-all ${
              tab === t ? 'bg-primary text-white' : 'bg-gray-100 text-secondary/60 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-5 flex flex-col gap-3">
        {loading
          ? [1,2,3].map(i => <SkeletonCard key={i} />)
          : filtered.length > 0
            ? filtered.map(s => (
                <SessionItem
                  key={s.id}
                  session={s}
                  navigate={navigate}
                  onConfirm={handleConfirm}
                  onDispute={setDisputeId}
                />
              ))
            : <EmptyState tab={tab} />
        }
      </div>

      {/* Dispute Modal */}
      {disputeId && (
        <DisputeModal
          sessionId={disputeId}
          onClose={() => setDisputeId(null)}
          onSuccess={() => { setDisputeId(null); load() }}
          showToast={showToast}
        />
      )}
    </div>
  )
}

function SessionItem({ session, navigate, onConfirm, onDispute }) {
  const meta = STATUS_META[session.status] || STATUS_META.PENDING
  const Icon = meta.icon
  const tutorName = `${session.tutor_first_name || ''} ${session.tutor_last_name || ''}`.trim() || 'Tutor'
  const date = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Scheduled'

  const canConfirm  = session.status === 'COMPLETED' && !session.parent_confirmed
  const canDispute  = session.status === 'COMPLETED'
  const canCancel   = ['PENDING', 'ACCEPTED', 'SCHEDULED'].includes(session.status)

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-outfit font-semibold text-base text-secondary">{session.subject}</h3>
          <p className="font-inter text-xs text-secondary/50 mt-0.5">with {tutorName}</p>
          <p className="font-inter text-xs text-secondary/50 mt-0.5 flex items-center gap-1">
            <Calendar size={11} />{date}
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold font-inter flex items-center gap-1 ${meta.color}`}>
          <Icon size={11} />{meta.label}
        </span>
      </div>

      {/* Status-specific actions */}
      <div className="flex gap-2 flex-wrap">
        {session.status === 'PENDING' && (
          <StatusNote icon="⏳" text="Waiting for tutor to accept" />
        )}
        {session.status === 'ACCEPTED' && (
          <ActionButton color="primary" onClick={() => navigate(`/student/payment/${session.id}`)}>
            💳 Pay Now
          </ActionButton>
        )}
        {session.status === 'SCHEDULED' && (
          <ActionButton color="success" onClick={() => {}}>
            📹 Join Session
          </ActionButton>
        )}
        {canConfirm && (
          <ActionButton color="success" onClick={() => onConfirm(session.id)}>
            ✅ Confirm Completion
          </ActionButton>
        )}
        {canDispute && (
          <ActionButton color="danger" onClick={() => onDispute(session.id)}>
            🚨 Report Issue
          </ActionButton>
        )}
        {canCancel && (
          <CancelButton sessionId={session.id} />
        )}
      </div>

      {/* Escrow status for completed */}
      {session.status === 'COMPLETED' && session.payout_status && (
        <div className="mt-3 pt-3 border-t border-secondary/10">
          <p className="font-inter text-xs text-secondary/50">
            💰 Payout status: <span className="font-semibold text-secondary">{session.payout_status}</span>
          </p>
        </div>
      )}
    </GlassCard>
  )
}

function ActionButton({ children, color, onClick }) {
  const colors = {
    primary: 'bg-primary text-white',
    success: 'bg-success text-white',
    danger:  'bg-red-500 text-white',
  }
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-inter font-semibold ${colors[color]} transition-opacity hover:opacity-90`}
    >
      {children}
    </button>
  )
}

function CancelButton({ sessionId }) {
  const [cancelling, setCancelling] = useState(false)
  const now = new Date()

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return
    setCancelling(true)
    try {
      await sessionsAPI.cancel(sessionId, 'Cancelled by student')
      window.location.reload()
    } catch {
      alert('Failed to cancel. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={cancelling}
      className="px-3 py-1.5 rounded-xl text-xs font-inter font-semibold bg-red-50 text-red-500 transition-opacity hover:opacity-80 disabled:opacity-50"
    >
      {cancelling ? '…' : '✗ Cancel'}
    </button>
  )
}

function StatusNote({ icon, text }) {
  return (
    <p className="font-inter text-xs text-secondary/50">{icon} {text}</p>
  )
}

function EmptyState({ tab }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">📅</div>
      <p className="font-outfit font-semibold text-secondary">No {tab.toLowerCase()} sessions</p>
      <p className="font-inter text-sm text-secondary/50 mt-1">
        {tab === 'Upcoming' ? 'Book a session to get started' : 'Your completed sessions will appear here'}
      </p>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white/70 border border-white/45 rounded-2xl p-4 flex flex-col gap-3">
      <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-shimmer w-1/2" />
      <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-shimmer w-1/3" />
      <div className="h-3 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-shimmer w-1/4" />
    </div>
  )
}

const DISPUTE_REASONS = [
  'Tutor did not show up',
  'Session ended early',
  'Content was not as described',
  'Technical issues (tutor side)',
  'Unprofessional behaviour',
  'Other',
]

function DisputeModal({ sessionId, onClose, onSuccess, showToast }) {
  const [reason,      setReason]      = useState('')
  const [description, setDescription] = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const handleSubmit = async () => {
    if (!reason) { showToast('Please select a reason', 'error'); return }
    setSubmitting(true)
    try {
      await sessionsAPI.raiseDispute(sessionId, { reason, description: description.trim() })
      showToast('Dispute submitted. Our team will review within 24 hours.', 'success')
      onSuccess()
    } catch {
      showToast('Could not submit dispute. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 pb-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-outfit font-bold text-base text-secondary">Report an Issue</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={15} className="text-secondary/60" />
          </button>
        </div>

        <p className="font-inter text-xs text-secondary/50 mb-4">
          What went wrong? Our support team will review your report within 24 hours.
        </p>

        {/* Reason selector */}
        <div className="flex flex-col gap-2 mb-4">
          {DISPUTE_REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={`text-left px-4 py-2.5 rounded-xl text-xs font-inter transition-all border ${
                reason === r
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-50 text-secondary/70 border-secondary/10 hover:border-secondary/20'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Additional details (optional)…"
          rows={3}
          className="w-full border border-secondary/15 rounded-2xl px-4 py-3 font-inter text-sm text-secondary bg-gray-50 outline-none focus:border-primary resize-none placeholder:text-secondary/40 mb-4"
        />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-2xl bg-red-500 text-white font-inter font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-90"
        >
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </div>
    </div>
  )
}
