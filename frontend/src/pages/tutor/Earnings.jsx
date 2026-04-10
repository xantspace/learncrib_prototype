import React, { useEffect, useState } from 'react'
import { Wallet, Clock, CheckCircle, TrendingUp, ExternalLink } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import PageHeader from '@/components/shared/PageHeader'
import { payoutsAPI } from '@/services/api'

const PAYOUT_STATUS = {
  SCHEDULED: { label: 'Scheduled',  color: 'bg-yellow-100 text-yellow-700' },
  HELD:      { label: 'In Escrow',  color: 'bg-blue-100 text-blue-700' },
  PROCESSED: { label: 'Processing', color: 'bg-primary-light text-primary' },
  PAID:      { label: 'Paid',       color: 'bg-green-100 text-green-700' },
  FAILED:    { label: 'Failed',     color: 'bg-red-100 text-red-500' },
}

export default function TutorEarnings() {
  const [payouts,  setPayouts]  = useState([])
  const [earnings, setEarnings] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      payoutsAPI.list().catch(() => ({ data: [] })),
      payoutsAPI.getEarnings().catch(() => ({ data: null })),
    ]).then(([pRes, eRes]) => {
      setPayouts(Array.isArray(pRes.data) ? pRes.data : pRes.data?.results || [])
      setEarnings(eRes.data)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Earnings" back={false} />

      <div className="px-5">
        {/* Earnings summary */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #0A1444, hsl(220,50%,25%))' }}>
          <p className="font-inter text-xs text-white/60 mb-1">Available Balance</p>
          <h2 className="font-outfit font-bold text-4xl text-white mb-1">
            ₦{Number(earnings?.available || 0).toLocaleString()}
          </h2>
          <p className="font-inter text-xs text-white/60 mb-5">Next payout: Every Friday at 10:00 AM</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="font-outfit font-bold text-xl text-white">₦{Number(earnings?.month_total || 0).toLocaleString()}</p>
              <p className="text-xs text-white/60">This Month</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="font-outfit font-bold text-xl text-white">₦{Number(earnings?.pending || 0).toLocaleString()}</p>
              <p className="text-xs text-white/60">In Escrow</p>
            </div>
          </div>
        </div>

        {/* Escrow explanation */}
        <GlassCard className="p-4 mb-5 flex items-start gap-3" hover={false}>
          <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">How Payouts Work</p>
            <p className="font-inter text-xs text-secondary/55 leading-relaxed mt-0.5">
              Funds are held for 48 hours after session completion, then released for weekly payout every Friday at 10 AM.
            </p>
          </div>
        </GlassCard>

        {/* Transaction list */}
        <h3 className="font-outfit font-semibold text-base text-secondary mb-3">Transaction History</h3>
        {loading
          ? [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-shimmer mb-3" />)
          : payouts.length > 0
            ? payouts.map(p => <PayoutRow key={p.id} payout={p} />)
            : <EmptyPayouts />
        }
      </div>
    </div>
  )
}

function PayoutRow({ payout }) {
  const meta = PAYOUT_STATUS[payout.status] || PAYOUT_STATUS.SCHEDULED
  const date = payout.processed_at || payout.scheduled_date
    ? new Date(payout.processed_at || payout.scheduled_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <GlassCard className="p-4 flex items-center gap-4 mb-3">
      <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
        <Wallet size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-outfit font-semibold text-sm text-secondary">Session Payout</p>
        <p className="font-inter text-xs text-secondary/50">{date}</p>
      </div>
      <div className="text-right">
        <p className="font-outfit font-bold text-sm text-secondary">₦{Number(payout.amount).toLocaleString()}</p>
        <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
      </div>
    </GlassCard>
  )
}

function EmptyPayouts() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">💰</div>
      <p className="font-outfit font-semibold text-secondary">No transactions yet</p>
      <p className="font-inter text-sm text-secondary/50 mt-1">Complete sessions to start earning</p>
    </div>
  )
}
