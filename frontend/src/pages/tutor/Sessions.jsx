import React, { useEffect, useState } from 'react'
import { Calendar, CheckCircle, XCircle, Clock, Lock, ShieldCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'
import { sessionsAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'
import { useEscrowStore, ESCROW_STATUS } from '@/store/escrowStore'

const TABS = ['Requests', 'Upcoming', 'History']

export default function TutorSessions() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('Requests')
  const { showToast } = useUIStore()

  const load = () => {
    setLoading(true)
    sessionsAPI.list()
      .then(r => setSessions(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = sessions.filter(s => {
    if (tab === 'Requests') return s.status === 'PENDING'
    if (tab === 'Upcoming') return ['ACCEPTED', 'SCHEDULED'].includes(s.status)
    return ['COMPLETED', 'CANCELLED', 'REJECTED'].includes(s.status)
  })

  const pendingCount = sessions.filter(s => s.status === 'PENDING').length

  const handleAccept = async (id) => {
    try {
      await sessionsAPI.accept(id)
      showToast('Booking accepted!', 'success')
      load()
    } catch {
      showToast('Failed to accept booking', 'error')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Decline this booking request?')) return
    try {
      await sessionsAPI.reject(id)
      showToast('Booking declined', 'info')
      load()
    } catch {
      showToast('Failed to decline booking', 'error')
    }
  }

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this session as completed?')) return
    try {
      await sessionsAPI.complete(id)
      showToast('Session marked complete!', 'success')
      load()
    } catch {
      showToast('Failed to update session', 'error')
    }
  }

  return (
    <div>
      <PageHeader title="Sessions" back={false} />

      {/* Tabs */}
      <div className="px-5 flex gap-2 mb-4">
        {TABS.map(t => {
          const badge = t === 'Requests' && pendingCount > 0
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-inter font-semibold transition-all flex items-center gap-1 ${
                tab === t ? 'bg-primary text-white' : 'bg-gray-100 text-secondary/60 hover:bg-gray-200'
              }`}
            >
              {t}
              {badge && (
                <span className={`w-4 h-4 rounded-full text-[0.6rem] flex items-center justify-center ${
                  tab === t ? 'bg-white text-primary' : 'bg-primary text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="px-5 flex flex-col gap-3">
        {loading
          ? [1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-shimmer" />)
          : filtered.length > 0
            ? filtered.map(s => (
                <SessionCard
                  key={s.id}
                  session={s}
                  tab={tab}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onComplete={handleComplete}
                />
              ))
            : <EmptyState tab={tab} />
        }
      </div>
    </div>
  )
}

function SessionCard({ session, tab, onAccept, onReject, onComplete }) {
  const escrowStore  = useEscrowStore()
  const escrowRecord = escrowStore.getBySessionId(session.id)
  const escrowSC     = escrowRecord ? ESCROW_STATUS[escrowRecord.status] : null

  const studentName = [
    session.student_first_name || session.parent_first_name,
    session.student_last_name  || session.parent_last_name,
  ].filter(Boolean).join(' ') || 'Student'

  const initials = studentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const date = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString('en-NG', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'TBD'

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(220,60%,55%), hsl(220,40%,40%))' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">{studentName}</p>
            <p className="font-inter text-xs text-secondary/50">{session.subject}</p>
            <p className="font-inter text-xs text-secondary/40 flex items-center gap-1 mt-0.5">
              <Calendar size={10} />{date}
            </p>
          </div>
        </div>
        <p className="font-outfit font-bold text-sm text-primary">
          ₦{Number(session.amount || 0).toLocaleString()}
        </p>
      </div>

      {/* Requests: Accept / Decline */}
      {tab === 'Requests' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onAccept(session.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-inter font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
          >
            ✓ Accept
          </button>
          <button
            onClick={() => onReject(session.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-inter font-semibold bg-red-50 text-red-500 hover:opacity-80 transition-opacity"
          >
            ✗ Decline
          </button>
        </div>
      )}

      {/* Upcoming: Start / Complete */}
      {tab === 'Upcoming' && session.status === 'SCHEDULED' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => {}}
            className="flex-1 py-2.5 rounded-xl text-xs font-inter font-semibold bg-success text-white hover:opacity-90 transition-opacity"
          >
            📹 Start Session
          </button>
          <button
            onClick={() => onComplete(session.id)}
            className="flex-1 py-2.5 rounded-xl text-xs font-inter font-semibold bg-gray-100 text-secondary/60 hover:bg-gray-200 transition-colors"
          >
            ✓ Mark Complete
          </button>
        </div>
      )}
      {tab === 'Upcoming' && session.status === 'ACCEPTED' && (
        <p className="font-inter text-xs text-secondary/50 mt-1">⏳ Awaiting student payment</p>
      )}

      {/* Upcoming: escrow trust note */}
      {tab === 'Upcoming' && session.status === 'SCHEDULED' && escrowRecord && (
        <div className="mt-2 pt-2 border-t border-secondary/10 flex items-center gap-1.5">
          <Lock size={11} className="text-blue-500 flex-shrink-0" />
          <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded-full ${escrowSC?.color}`}>
            {escrowSC?.label}
          </span>
          <span className="font-inter text-[0.65rem] text-secondary/40">— you'll be paid after completion</span>
        </div>
      )}

      {/* History: status badge + live escrow payout status */}
      {tab === 'History' && (
        <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
          <span className={`text-[0.7rem] font-semibold px-2.5 py-1 rounded-full ${
            session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
            session.status === 'CANCELLED' ? 'bg-red-100 text-red-500' :
            'bg-gray-100 text-secondary/50'
          }`}>
            {session.status}
          </span>
          {escrowRecord ? (
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={11} className={escrowRecord.status === 'RELEASED' ? 'text-green-500' : 'text-secondary/30'} />
              <span className={`text-[0.7rem] font-semibold px-2 py-0.5 rounded-full ${escrowSC?.color}`}>
                {escrowSC?.label}
              </span>
            </div>
          ) : session.payout_status ? (
            <p className="font-inter text-xs text-secondary/50">💰 {session.payout_status}</p>
          ) : null}
        </div>
      )}
    </GlassCard>
  )
}

function EmptyState({ tab }) {
  const config = {
    Requests: { emoji: '📬', title: 'No booking requests', sub: 'New bookings will appear here' },
    Upcoming: { emoji: '📅', title: 'No upcoming sessions', sub: 'Accept a request to get started' },
    History:  { emoji: '📋', title: 'No history yet',      sub: 'Completed sessions will appear here' },
  }
  const { emoji, title, sub } = config[tab]
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="font-outfit font-semibold text-secondary">{title}</p>
      <p className="font-inter text-sm text-secondary/50 mt-1">{sub}</p>
    </div>
  )
}
