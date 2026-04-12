import React, { useState } from 'react'
import { Search, CheckCircle, RotateCcw, AlertTriangle, DollarSign, Lock, TrendingUp, Clock } from 'lucide-react'
import { useEscrowStore, ESCROW_STATUS } from '@/store/escrowStore'
import { useUIStore } from '@/store/uiStore'

const FILTERS = ['ALL', 'PENDING', 'ESCROW', 'IN_SESSION', 'COMPLETED', 'RELEASED', 'DISPUTED', 'REFUNDED']

export default function AdminPayments() {
  const escrow    = useEscrowStore()
  const { showToast } = useUIStore()
  const [query,   setQuery]   = useState('')
  const [filter,  setFilter]  = useState('ALL')
  const [confirm, setConfirm] = useState(null) // { action, record }

  const records  = escrow.all()
  const totals   = escrow.totals()

  const filtered = records.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter
    const matchQuery  =
      p.studentName.toLowerCase().includes(query.toLowerCase()) ||
      p.tutorName.toLowerCase().includes(query.toLowerCase()) ||
      p.paymentRef.toLowerCase().includes(query.toLowerCase()) ||
      p.subject.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const handleAction = (action, record) => setConfirm({ action, record })

  const executeAction = () => {
    const { action, record } = confirm
    if (action === 'release') {
      escrow.release(record.sessionId)
      showToast(`₦${record.total.toLocaleString()} released to ${record.tutorName}`, 'success')
    } else if (action === 'refund') {
      escrow.refund(record.sessionId)
      showToast(`₦${record.total.toLocaleString()} refunded to ${record.studentName}`, 'info')
    } else if (action === 'dispute') {
      escrow.dispute(record.sessionId)
      showToast(`Payment frozen — ${record.paymentRef} marked as disputed`, 'error')
    }
    setConfirm(null)
  }

  const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Payments</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">Escrow visibility & fund control</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          icon={Lock}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          label="In Escrow"
          value={`₦${totals.escrowAmount.toLocaleString()}`}
          sub={`${totals.escrowCount} transactions`}
        />
        <SummaryCard
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          label="Released"
          value={`₦${totals.releasedAmount.toLocaleString()}`}
          sub={`${totals.releasedCount} transactions`}
        />
        <SummaryCard
          icon={Clock}
          iconColor="text-yellow-600"
          iconBg="bg-yellow-50"
          label="Pending"
          value={`${totals.pendingCount} txns`}
          sub="Awaiting payment"
        />
        <SummaryCard
          icon={AlertTriangle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
          label="Issues"
          value={`${totals.disputedCount + totals.refundedCount} txns`}
          sub={`${totals.disputedCount} disputed · ${totals.refundedCount} refunded`}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search student, tutor, reference…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                filter === f
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-secondary/60 border-gray-200 hover:border-gray-300'
              }`}
            >
              {f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Ref</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Student</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden md:table-cell">Tutor</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Subject</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Amount</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => {
                const sc = ESCROW_STATUS[p.status] ?? ESCROW_STATUS.PENDING
                return (
                  <tr key={p.sessionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-secondary/40">{p.paymentRef}</td>
                    <td className="px-5 py-3 font-medium text-secondary">{p.studentName}</td>
                    <td className="px-5 py-3 text-secondary/55 hidden md:table-cell">{p.tutorName}</td>
                    <td className="px-5 py-3 text-secondary/55 hidden lg:table-cell">{p.subject}</td>
                    <td className="px-5 py-3">
                      <p className="font-outfit font-bold text-secondary">₦{p.total.toLocaleString()}</p>
                      <p className="font-inter text-[0.65rem] text-secondary/35">
                        ₦{p.sessionAmount.toLocaleString()} + ₦{p.platformFee.toLocaleString()} fee
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap ${sc.color}`}>
                        {sc.label}
                      </span>
                      <p className="font-inter text-[0.6rem] text-secondary/35 mt-0.5 hidden lg:block">{sc.desc}</p>
                    </td>
                    <td className="px-5 py-3 text-secondary/40 text-xs hidden lg:table-cell whitespace-nowrap">
                      {fmt(p.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.status === 'ESCROW' && (
                          <>
                            <ActionBtn
                              label="Release"
                              color="text-green-600 bg-green-50 hover:bg-green-100"
                              onClick={() => handleAction('release', p)}
                            />
                            <ActionBtn
                              label="Refund"
                              color="text-red-500 bg-red-50 hover:bg-red-100"
                              onClick={() => handleAction('refund', p)}
                            />
                          </>
                        )}
                        {p.status === 'COMPLETED' && (
                          <ActionBtn
                            label="Release"
                            color="text-green-600 bg-green-50 hover:bg-green-100"
                            onClick={() => handleAction('release', p)}
                          />
                        )}
                        {(p.status === 'ESCROW' || p.status === 'IN_SESSION') && (
                          <ActionBtn
                            label="Freeze"
                            color="text-orange-500 bg-orange-50 hover:bg-orange-100"
                            onClick={() => handleAction('dispute', p)}
                          />
                        )}
                        {(p.status === 'RELEASED' || p.status === 'REFUNDED' || p.status === 'PENDING') && (
                          <span className="text-secondary/25 text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-secondary/40 font-inter text-sm">
              No transactions match your search.
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6">
            <h3 className="font-outfit font-bold text-base text-secondary mb-1">
              {confirm.action === 'release' ? 'Release Funds?' :
               confirm.action === 'refund'  ? 'Issue Refund?' : 'Freeze Payment?'}
            </h3>
            <p className="font-inter text-sm text-secondary/60 mb-5">
              {confirm.action === 'release'
                ? `₦${confirm.record.total.toLocaleString()} will be released to ${confirm.record.tutorName}.`
                : confirm.action === 'refund'
                ? `₦${confirm.record.total.toLocaleString()} will be refunded to ${confirm.record.studentName}.`
                : `${confirm.record.paymentRef} will be frozen. No funds move until unfrozen.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-secondary text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  confirm.action === 'release' ? 'bg-green-600 hover:bg-green-700' :
                  confirm.action === 'refund'  ? 'bg-red-500 hover:bg-red-600' :
                  'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, iconColor, iconBg, label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon size={17} className={iconColor} />
      </div>
      <p className="font-outfit font-bold text-xl text-secondary">{value}</p>
      <p className="font-inter text-xs text-secondary/50 mt-0.5">{label}</p>
      <p className="font-inter text-[0.65rem] text-secondary/35 mt-0.5">{sub}</p>
    </div>
  )
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-[0.7rem] font-semibold transition-colors ${color}`}
    >
      {label}
    </button>
  )
}
