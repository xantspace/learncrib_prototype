import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BadgeCheck, Clock, XCircle, AlertTriangle } from 'lucide-react'

const CONFIG = {
  UNVERIFIED: {
    icon:  AlertTriangle,
    bg:    'bg-yellow-50 border-yellow-200',
    icon_c:'text-yellow-500',
    title: 'Get Verified',
    body:  'Complete verification to go online and receive bookings.',
    cta:   'Start Verification',
    ctaBg: 'bg-yellow-500 text-white',
  },
  PENDING: {
    icon:  Clock,
    bg:    'bg-blue-50 border-blue-200',
    icon_c:'text-blue-500',
    title: 'Verification Pending',
    body:  'Your submission is under review. We\'ll notify you in 2–3 business days.',
    cta:   null,
    ctaBg: '',
  },
  REJECTED: {
    icon:  XCircle,
    bg:    'bg-red-50 border-red-200',
    icon_c:'text-red-500',
    title: 'Verification Rejected',
    body:  'Your application was not approved. Please review the feedback and resubmit.',
    cta:   'Resubmit',
    ctaBg: 'bg-red-500 text-white',
  },
  APPROVED: null, // no banner for verified tutors
}

export default function VerificationBanner({ status = 'UNVERIFIED', rejectionReason }) {
  const navigate = useNavigate()
  const cfg = CONFIG[status]
  if (!cfg) return null

  const Icon = cfg.icon

  return (
    <div className={`mx-5 mb-5 rounded-2xl border p-4 flex items-start gap-3 ${cfg.bg}`}>
      <div className={`flex-shrink-0 mt-0.5 ${cfg.icon_c}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-outfit font-bold text-sm text-secondary">{cfg.title}</p>
        <p className="font-inter text-xs text-secondary/60 mt-0.5 leading-relaxed">{cfg.body}</p>
        {status === 'REJECTED' && rejectionReason && (
          <p className="font-inter text-xs text-red-500 mt-1 font-medium">Reason: {rejectionReason}</p>
        )}
      </div>
      {cfg.cta && (
        <button
          onClick={() => navigate('/tutor/verify')}
          className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold font-inter ${cfg.ctaBg}`}
        >
          {cfg.cta}
        </button>
      )}
    </div>
  )
}
