import React, { useState } from 'react'
import { AlertTriangle, Flag, CheckCircle, X } from 'lucide-react'

const MOCK_ISSUES = [
  { id: 'D001', session: 'S001', student: 'Temi Adeyemi',  tutor: 'Kolade Okonkwo', reason: 'Session ended early',            status: 'OPEN',     raised: 'Apr 10, 2025', flagged: false },
  { id: 'D002', session: 'S003', student: 'Grace Nwosu',   tutor: 'Babatunde Osei', reason: 'Tutor did not show up',          status: 'OPEN',     raised: 'Apr 9, 2025',  flagged: true  },
  { id: 'D003', session: 'S005', student: 'Tunde Bello',   tutor: 'Ngozi Adeleke',  reason: 'Technical issues (tutor side)',  status: 'RESOLVED', raised: 'Apr 7, 2025',  flagged: false },
  { id: 'D004', session: 'S007', student: 'Fatima Musa',   tutor: 'Amaka Eze',      reason: 'Content was not as described',   status: 'CLOSED',   raised: 'Apr 5, 2025',  flagged: false },
  { id: 'D005', session: 'S009', student: 'Chidi Obi',     tutor: 'Kolade Okonkwo', reason: 'Unprofessional behaviour',       status: 'OPEN',     raised: 'Apr 11, 2025', flagged: true  },
]

const STATUS_STYLE = {
  OPEN:     'bg-red-100 text-red-600',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED:   'bg-gray-100 text-secondary/50',
}

export default function AdminIssues() {
  const [issues, setIssues] = useState(MOCK_ISSUES)
  const [filter, setFilter] = useState('ALL')

  const filtered = issues.filter(i => filter === 'ALL' || i.status === filter)
  const openCount = issues.filter(i => i.status === 'OPEN').length

  const setStatus = (id, status) =>
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i))

  const toggleFlag = (id) =>
    setIssues(prev => prev.map(i => i.id === id ? { ...i, flagged: !i.flagged } : i))

  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-outfit font-bold text-2xl text-secondary">Issues</h1>
          <p className="font-inter text-sm text-secondary/50 mt-0.5">{openCount} open disputes requiring attention</p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="font-inter text-xs text-red-600 font-semibold">{openCount} require action</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['ALL', 'OPEN', 'RESOLVED', 'CLOSED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-secondary/60 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f === 'ALL' ? 'All Issues' : f[0] + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Issue cards */}
      <div className="flex flex-col gap-3">
        {filtered.map(issue => (
          <div
            key={issue.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 ${
              issue.flagged ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  issue.status === 'OPEN' ? 'bg-red-50' : 'bg-gray-100'
                }`}>
                  <AlertTriangle size={16} className={issue.status === 'OPEN' ? 'text-red-500' : 'text-secondary/40'} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-secondary/40">{issue.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold ${STATUS_STYLE[issue.status]}`}>
                      {issue.status}
                    </span>
                    {issue.flagged && (
                      <span className="px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold bg-orange-100 text-orange-600 flex items-center gap-1">
                        <Flag size={10} /> Flagged
                      </span>
                    )}
                  </div>
                  <p className="font-outfit font-semibold text-sm text-secondary mt-1">{issue.reason}</p>
                  <p className="font-inter text-xs text-secondary/50 mt-0.5">
                    {issue.student} ↔ {issue.tutor} · Session {issue.session}
                  </p>
                  <p className="font-inter text-xs text-secondary/35 mt-0.5">Raised {issue.raised}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {issue.status === 'OPEN' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => setStatus(issue.id, 'RESOLVED')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                >
                  <CheckCircle size={13} /> Mark Resolved
                </button>
                <button
                  onClick={() => setStatus(issue.id, 'CLOSED')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-secondary/60 text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  <X size={13} /> Close
                </button>
                <button
                  onClick={() => toggleFlag(issue.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    issue.flagged
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-50'
                      : 'bg-gray-100 text-secondary/60 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <Flag size={13} /> {issue.flagged ? 'Unflag' : 'Flag Urgent'}
                </button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <CheckCircle size={36} className="text-green-300 mx-auto mb-3" />
            <p className="font-outfit font-semibold text-secondary">All clear!</p>
            <p className="font-inter text-sm text-secondary/50 mt-1">No {filter !== 'ALL' ? filter.toLowerCase() : ''} issues</p>
          </div>
        )}
      </div>
    </div>
  )
}
