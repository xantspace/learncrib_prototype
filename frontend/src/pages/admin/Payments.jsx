import React, { useState } from 'react'
import { Search } from 'lucide-react'

const MOCK_PAYMENTS = [
  { id: 'PAY-001', session: 'S001', payer: 'Temi Adeyemi',  tutor: 'Kolade Okonkwo',  amount: 3500,  status: 'ESCROW',     date: 'Apr 10, 2025' },
  { id: 'PAY-002', session: 'S002', payer: 'Fatima Musa',   tutor: 'Amaka Eze',       amount: 3000,  status: 'ESCROW',     date: 'Apr 10, 2025' },
  { id: 'PAY-003', session: 'S004', payer: 'Emeka Okafor',  tutor: 'Kolade Okonkwo',  amount: 3500,  status: 'RELEASED',   date: 'Apr 9, 2025'  },
  { id: 'PAY-004', session: 'S006', payer: 'Chidi Obi',     tutor: 'Amaka Eze',       amount: 3000,  status: 'PENDING',    date: 'Apr 11, 2025' },
  { id: 'PAY-005', session: 'S007', payer: 'Grace Nwosu',   tutor: 'Babatunde Osei',  amount: 4000,  status: 'RELEASED',   date: 'Apr 8, 2025'  },
  { id: 'PAY-006', session: 'S008', payer: 'Tunde Bello',   tutor: 'Ngozi Adeleke',   amount: 5000,  status: 'REFUNDED',   date: 'Apr 7, 2025'  },
]

const STATUS_STYLE = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  ESCROW:   'bg-blue-100 text-blue-700',
  RELEASED: 'bg-green-100 text-green-700',
  REFUNDED: 'bg-red-100 text-red-400',
  FAILED:   'bg-red-100 text-red-500',
}

const STATUS_DESC = {
  PENDING:  'Awaiting payment from student',
  ESCROW:   'Funds held — pending session confirmation',
  RELEASED: 'Released to tutor after confirmation',
  REFUNDED: 'Refunded to student',
  FAILED:   'Payment failed',
}

const FILTERS = ['ALL', 'PENDING', 'ESCROW', 'RELEASED', 'REFUNDED']

export default function AdminPayments() {
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = MOCK_PAYMENTS.filter(p => {
    const matchStatus = filter === 'ALL' || p.status === filter
    const matchQuery  = p.payer.toLowerCase().includes(query.toLowerCase()) ||
                        p.tutor.toLowerCase().includes(query.toLowerCase()) ||
                        p.id.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const totalEscrow   = MOCK_PAYMENTS.filter(p => p.status === 'ESCROW').reduce((s, p) => s + p.amount, 0)
  const totalReleased = MOCK_PAYMENTS.filter(p => p.status === 'RELEASED').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Payments</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">Escrow visibility — read only</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'In Escrow',   value: `₦${totalEscrow.toLocaleString()}`,   color: 'bg-blue-50 text-blue-600',    count: MOCK_PAYMENTS.filter(p => p.status === 'ESCROW').length   },
          { label: 'Released',    value: `₦${totalReleased.toLocaleString()}`,  color: 'bg-green-50 text-green-600',  count: MOCK_PAYMENTS.filter(p => p.status === 'RELEASED').length },
          { label: 'Pending',     value: `${MOCK_PAYMENTS.filter(p => p.status === 'PENDING').length} txns`,  color: 'bg-yellow-50 text-yellow-600', count: null },
          { label: 'Refunded',    value: `${MOCK_PAYMENTS.filter(p => p.status === 'REFUNDED').length} txns`, color: 'bg-red-50 text-red-400',       count: null },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className={`font-outfit font-bold text-xl ${c.color.split(' ')[1]}`}>{c.value}</p>
            <p className="font-inter text-xs text-secondary/50 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search payer, tutor or reference…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-primary"
          />
        </div>
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
            {f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Ref</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Payer</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden md:table-cell">Tutor</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Amount</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-secondary/40">{p.id}</td>
                  <td className="px-5 py-3 font-medium text-secondary">{p.payer}</td>
                  <td className="px-5 py-3 text-secondary/55 hidden md:table-cell">{p.tutor}</td>
                  <td className="px-5 py-3 font-outfit font-bold text-secondary">₦{p.amount.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${STATUS_STYLE[p.status]}`}>
                        {p.status}
                      </span>
                      <p className="font-inter text-[0.65rem] text-secondary/35 mt-1 hidden lg:block">{STATUS_DESC[p.status]}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-secondary/40 text-xs hidden lg:table-cell">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-secondary/40 font-inter text-sm">No transactions match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
