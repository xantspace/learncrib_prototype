import React, { useState } from 'react'
import { BadgeCheck, Clock, CheckCircle, XCircle, X, User, BookOpen, CreditCard, Calendar, FileText, ChevronRight } from 'lucide-react'
import { useVerificationStore } from '@/store/verificationStore'
import { adminAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  style: 'bg-yellow-100 text-yellow-700' },
  APPROVED: { label: 'Approved', style: 'bg-green-100 text-green-700'  },
  REJECTED: { label: 'Rejected', style: 'bg-red-100 text-red-500'      },
}

function ReviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-secondary/50" />
      </div>
      <div>
        <p className="font-inter text-[0.65rem] text-secondary/40 uppercase tracking-wider">{label}</p>
        <p className="font-inter text-sm text-secondary font-medium">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function AdminVerifications() {
  const { showToast } = useUIStore()
  const vStore        = useVerificationStore()

  const [tab,          setTab]          = useState('PENDING')
  const [reviewing,    setReviewing]    = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting,    setRejecting]    = useState(false)

  const records = vStore.all().filter(r => r.status === tab)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const pendingCount  = vStore.pending().length
  const approvedCount = vStore.all().filter(r => r.status === 'APPROVED').length
  const rejectedCount = vStore.all().filter(r => r.status === 'REJECTED').length

  const handleApprove = (record) => {
    vStore.approve(record.email)
    adminAPI.approve(record.email).catch(() => {})
    showToast(`${record.name} approved — they can now go online`, 'success')
    setReviewing(null)
  }

  const handleReject = (record) => {
    if (!rejectReason.trim()) return
    vStore.reject(record.email, rejectReason)
    adminAPI.reject(record.email, { reason: rejectReason }).catch(() => {})
    showToast(`${record.name} rejected`, 'error')
    setRejectReason('')
    setRejecting(false)
    setReviewing(null)
  }

  const fmt = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Verifications</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">
          Review tutor submissions before they go live
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <SummaryChip label="Pending"  count={pendingCount}  color="bg-yellow-50 text-yellow-700 border-yellow-200" active={tab === 'PENDING'}  onClick={() => setTab('PENDING')} />
        <SummaryChip label="Approved" count={approvedCount} color="bg-green-50 text-green-700 border-green-200"   active={tab === 'APPROVED'} onClick={() => setTab('APPROVED')} />
        <SummaryChip label="Rejected" count={rejectedCount} color="bg-red-50 text-red-500 border-red-200"         active={tab === 'REJECTED'} onClick={() => setTab('REJECTED')} />
      </div>

      {/* List */}
      {records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BadgeCheck size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-outfit font-semibold text-secondary">No {tab.toLowerCase()} submissions</p>
          <p className="font-inter text-sm text-secondary/50 mt-1">
            {tab === 'PENDING' ? 'All submissions have been reviewed.' : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {records.map(r => (
            <div key={r.email} className="px-5 py-4 flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-sm flex-shrink-0">
                {initials(r.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-outfit font-semibold text-sm text-secondary">{r.name}</p>
                  <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[r.status]?.style}`}>
                    {STATUS_CONFIG[r.status]?.label}
                  </span>
                </div>
                <p className="font-inter text-xs text-secondary/45 mt-0.5">
                  {r.email} · {r.subjects?.join(', ')}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock size={10} className="text-secondary/30" />
                  <span className="font-inter text-[0.65rem] text-secondary/35">Submitted {fmt(r.submittedAt)}</span>
                </div>
                {r.status === 'REJECTED' && r.rejectionReason && (
                  <p className="font-inter text-xs text-red-500 mt-1">Reason: {r.rejectionReason}</p>
                )}
              </div>

              {/* Action */}
              {r.status === 'PENDING' ? (
                <button
                  onClick={() => { setReviewing(r); setRejecting(false); setRejectReason('') }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  Review <ChevronRight size={13} />
                </button>
              ) : r.status === 'APPROVED' ? (
                <BadgeCheck size={20} className="text-primary flex-shrink-0" />
              ) : (
                <button
                  onClick={() => { vStore.approve(r.email); showToast(`${r.name} re-approved`, 'success') }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-light text-primary text-xs font-semibold hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  Re-approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewing && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setReviewing(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-outfit font-bold text-base text-secondary">Review Submission</h2>
              <button onClick={() => setReviewing(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X size={16} className="text-secondary" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Identity bar */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-sm flex-shrink-0">
                  {initials(reviewing.name)}
                </div>
                <div>
                  <p className="font-outfit font-semibold text-sm text-secondary">{reviewing.name}</p>
                  <p className="font-inter text-xs text-secondary/45">{reviewing.email}</p>
                </div>
                <span className="ml-auto text-[0.65rem] bg-yellow-100 text-yellow-700 font-semibold px-2.5 py-1 rounded-full flex-shrink-0">Pending</span>
              </div>

              {/* Data */}
              <div className="px-5 py-4 flex flex-col gap-3">
                <ReviewRow icon={User}       label="Full Name"  value={reviewing.name} />
                <ReviewRow icon={CreditCard} label="ID Type"    value={reviewing.idType} />
                <ReviewRow icon={BookOpen}   label="Education"  value={reviewing.edu} />
                <ReviewRow icon={FileText}   label="Subjects"   value={reviewing.subjects?.join(', ')} />
                <ReviewRow icon={Calendar}   label="Submitted"  value={fmt(reviewing.submittedAt)} />
                {reviewing.selfie && (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <CheckCircle size={13} /> Selfie captured
                  </div>
                )}
              </div>

              {/* Doc placeholder */}
              <div className="mx-5 mb-4 rounded-xl border-2 border-dashed border-gray-200 py-4 flex items-center justify-center gap-2 text-secondary/40">
                <FileText size={16} />
                <span className="font-inter text-xs">ID document — stored securely</span>
              </div>

              {/* Rejection reason */}
              {rejecting && (
                <div className="px-5 mb-3">
                  <p className="font-inter text-xs font-semibold text-secondary/60 mb-1.5">
                    Rejection reason <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Explain why — this will be shown to the tutor."
                    rows={3}
                    autoFocus
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-inter text-secondary outline-none focus:border-red-400 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 pb-5 pt-3 flex gap-2 border-t border-gray-100 flex-shrink-0">
              {!rejecting ? (
                <>
                  <button
                    onClick={() => setRejecting(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(reviewing)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setRejecting(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-secondary text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(reviewing)}
                    disabled={!rejectReason.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <XCircle size={15} /> Confirm Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryChip({ label, count, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
        active ? 'ring-2 ring-primary ring-offset-1' : ''
      } ${color}`}
    >
      {label}
      <span className="font-bold">{count}</span>
    </button>
  )
}
