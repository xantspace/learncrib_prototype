import React, { useState } from 'react'
import { Search, CheckCircle, XCircle, Circle, X, FileText, Eye, User, BookOpen, CreditCard, Calendar, BadgeCheck } from 'lucide-react'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { useVerificationStore } from '@/store/verificationStore'
import { adminAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

// Base tutor list — verification status is overlaid from verificationStore
const BASE_TUTORS = [
  { id: 1, name: 'Kolade Okonkwo',  email: 'kolade@mail.com',  subjects: ['Maths','Physics'],       rate: 3500, rating: 4.9, sessions: 42, online: true,  available: true,  edu: 'B.Sc Mathematics',      idType: 'National ID (NIN)',      submitted: 'Jan 8, 2025'  },
  { id: 2, name: 'Amaka Eze',       email: 'amaka@mail.com',   subjects: ['Chemistry','Biology'],   rate: 3000, rating: 4.7, sessions: 28, online: false, available: true,  edu: 'B.Sc Chemistry',        idType: 'International Passport', submitted: 'Jan 10, 2025' },
  { id: 3, name: 'Babatunde Osei',  email: 'baba@mail.com',    subjects: ['Physics','Maths'],       rate: 4000, rating: 4.8, sessions: 61, online: true,  available: false, edu: 'M.Sc Physics',          idType: 'Driver\'s License',      submitted: 'Dec 15, 2024' },
  { id: 4, name: 'Adaeze Nnoli',    email: 'adaeze@mail.com',  subjects: ['English','Literature'],  rate: 2500, rating: 0,   sessions: 0,  online: false, available: false, edu: 'B.A English',           idType: 'National ID (NIN)',      submitted: 'Apr 9, 2025'  },
  { id: 5, name: 'Emeka Okafor',    email: 'emeka@mail.com',   subjects: ['Economics','Commerce'],  rate: 2800, rating: 4.2, sessions: 15, online: false, available: false, edu: 'B.Sc Economics',        idType: 'Voter\'s Card',          submitted: 'Feb 20, 2025' },
  { id: 6, name: 'Ngozi Adeleke',   email: 'ngozi@mail.com',   subjects: ['Coding','Design'],       rate: 5000, rating: 0,   sessions: 0,  online: false, available: false, edu: 'B.Sc Computer Science', idType: 'International Passport', submitted: 'Apr 11, 2025' },
]

// Static fallback status for tutors with no verificationStore record
const STATIC_STATUS = {
  'kolade@mail.com': 'approved',
  'amaka@mail.com':  'approved',
  'baba@mail.com':   'approved',
  'emeka@mail.com':  'disabled',
}

const STATUS_STYLE = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  disabled: 'bg-red-100 text-red-500',
  rejected: 'bg-red-100 text-red-500',
}

function ReviewRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-secondary/50" />
      </div>
      <div>
        <p className="font-inter text-[0.65rem] text-secondary/40 uppercase tracking-wider">{label}</p>
        <p className="font-inter text-sm text-secondary font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function AdminTutors() {
  const { showToast } = useUIStore()
  const vStore        = useVerificationStore()

  const [query,          setQuery]         = useState('')
  const [filter,         setFilter]        = useState('ALL')
  const [reviewingTutor, setReviewingTutor] = useState(null)
  const [rejectReason,   setRejectReason]  = useState('')
  const [rejecting,      setRejecting]     = useState(false)

  // Merge BASE_TUTORS with live verificationStore records
  const tutors = BASE_TUTORS.map(t => {
    const record = vStore.getRecord(t.email)
    const storeStatus = record?.status?.toLowerCase()   // 'pending'|'approved'|'rejected'
    const status = storeStatus ?? STATIC_STATUS[t.email] ?? 'approved'
    return {
      ...t,
      status,
      rejectionReason: record?.rejectionReason ?? null,
      verifiedBadge: status === 'approved',
    }
  })

  // Also include any live submissions not in BASE_TUTORS (e.g. the logged-in dev tutor)
  const extraEmails = Object.keys(vStore.records).filter(
    email => !BASE_TUTORS.some(t => t.email === email)
  )
  const extraTutors = extraEmails.map(email => {
    const r = vStore.records[email]
    return {
      id:       email,
      name:     r.name || email,
      email,
      subjects: r.subjects || [],
      rate:     0,
      rating:   0,
      sessions: 0,
      online:   false,
      available:false,
      edu:      r.edu || '—',
      idType:   r.idType || '—',
      submitted:r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric'}) : '—',
      status:   r.status?.toLowerCase() ?? 'pending',
      rejectionReason: r.rejectionReason ?? null,
      verifiedBadge: r.status === 'APPROVED',
    }
  })

  const allTutors = [...tutors, ...extraTutors]

  const filtered = allTutors.filter(t => {
    const matchStatus = filter === 'ALL' || t.status === filter.toLowerCase()
    const matchQuery  = t.name.toLowerCase().includes(query.toLowerCase()) ||
                        t.subjects.some(s => s.toLowerCase().includes(query.toLowerCase()))
    return matchStatus && matchQuery
  })

  const pendingCount = allTutors.filter(t => t.status === 'pending').length

  const handleApprove = async (tutor) => {
    vStore.approve(tutor.email)
    adminAPI.approve(tutor.id).catch(() => {})
    showToast(`${tutor.name} approved`, 'success')
    setReviewingTutor(null)
  }

  const handleReject = async (tutor) => {
    if (!rejectReason.trim()) return
    vStore.reject(tutor.email, rejectReason)
    adminAPI.reject(tutor.id, { reason: rejectReason }).catch(() => {})
    showToast(`${tutor.name} rejected`, 'error')
    setRejectReason('')
    setRejecting(false)
    setReviewingTutor(null)
  }

  const handleDisable = async (tutor) => {
    vStore.reject(tutor.email, 'Account disabled by admin')
    adminAPI.disable(tutor.id).catch(() => {})
    showToast(`${tutor.name} disabled`, 'info')
  }

  const handleEnable = async (tutor) => {
    vStore.approve(tutor.email)
    adminAPI.enable(tutor.id).catch(() => {})
    showToast(`${tutor.name} re-enabled`, 'success')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Tutors</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">
          {pendingCount} pending approval
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name or subject…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-primary"
          />
        </div>
        {['ALL','Approved','Pending','Disabled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-secondary/60 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f}
            {f === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-400 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review Modal */}
      {reviewingTutor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setReviewingTutor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-outfit font-bold text-base text-secondary">Tutor Submission Review</h2>
              <button onClick={() => setReviewingTutor(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X size={16} className="text-secondary" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Identity */}
              <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-gray-50">
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-sm flex-shrink-0">
                  {reviewingTutor.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-outfit font-semibold text-sm text-secondary">{reviewingTutor.name}</p>
                  <p className="font-inter text-xs text-secondary/45">{reviewingTutor.email}</p>
                </div>
                <span className="ml-auto text-[0.65rem] bg-yellow-100 text-yellow-700 font-semibold px-2.5 py-1 rounded-full flex-shrink-0">Pending</span>
              </div>

              {/* Submitted data */}
              <div className="px-5 py-4 flex flex-col gap-3">
                <ReviewRow icon={User}       label="Full Name"  value={reviewingTutor.name} />
                <ReviewRow icon={CreditCard} label="ID Type"    value={reviewingTutor.idType} />
                <ReviewRow icon={BookOpen}   label="Education"  value={reviewingTutor.edu} />
                <ReviewRow icon={FileText}   label="Subjects"   value={reviewingTutor.subjects.join(', ')} />
                <ReviewRow icon={Calendar}   label="Submitted"  value={reviewingTutor.submitted} />
              </div>

              {/* Document placeholder */}
              <div className="mx-5 mb-4 rounded-xl border-2 border-dashed border-gray-200 py-4 flex items-center justify-center gap-2 text-secondary/40">
                <FileText size={16} />
                <span className="font-inter text-xs">ID document — stored securely</span>
              </div>

              {/* Reject reason input */}
              {rejecting && (
                <div className="px-5 mb-3">
                  <p className="font-inter text-xs font-semibold text-secondary/60 mb-1.5">
                    Rejection reason <span className="text-red-500">*</span>
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Explain why this submission is rejected…"
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-inter text-secondary outline-none focus:border-red-400 resize-none"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Actions */}
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
                    onClick={() => handleApprove(reviewingTutor)}
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
                    onClick={() => handleReject(reviewingTutor)}
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

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 ${
              t.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-sm">
                    {t.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${t.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-outfit font-semibold text-sm text-secondary">{t.name}</p>
                    {t.verifiedBadge && <BadgeCheck size={14} className="text-primary flex-shrink-0" />}
                  </div>
                  <p className="font-inter text-xs text-secondary/45">{t.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold flex-shrink-0 capitalize ${STATUS_STYLE[t.status] || STATUS_STYLE.approved}`}>
                {t.status}
              </span>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {t.subjects.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 text-secondary/60 text-xs font-medium">{s}</span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="bg-gray-50 rounded-xl py-2">
                <p className="font-outfit font-bold text-sm text-secondary">₦{t.rate.toLocaleString()}</p>
                <p className="font-inter text-[0.6rem] text-secondary/40">Rate/hr</p>
              </div>
              <div className="bg-gray-50 rounded-xl py-2">
                <p className="font-outfit font-bold text-sm text-secondary">{t.rating > 0 ? t.rating : '—'}</p>
                <p className="font-inter text-[0.6rem] text-secondary/40">Rating</p>
              </div>
              <div className="bg-gray-50 rounded-xl py-2">
                <p className="font-outfit font-bold text-sm text-secondary">{t.sessions}</p>
                <p className="font-inter text-[0.6rem] text-secondary/40">Sessions</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {t.status === 'pending' && (
                <>
                  <button
                    onClick={() => { setReviewingTutor(t); setRejecting(false); setRejectReason('') }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={13} /> Review
                  </button>
                  <button
                    onClick={() => handleApprove(t)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                    title="Quick approve"
                  >
                    <CheckCircle size={13} />
                  </button>
                </>
              )}
              {t.status === 'approved' && (
                <button
                  onClick={() => handleDisable(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <XCircle size={13} /> Disable
                </button>
              )}
              {(t.status === 'disabled' || t.status === 'rejected') && (
                <button
                  onClick={() => handleEnable(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-light text-primary text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  <CheckCircle size={13} /> Re-enable
                </button>
              )}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ${t.available ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-secondary/40'}`}>
                <Circle size={8} className={t.available ? 'fill-blue-500 text-blue-500' : 'fill-gray-300 text-gray-300'} />
                {t.available ? 'Available' : 'Busy'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
