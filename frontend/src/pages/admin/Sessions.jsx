import React, { useState } from 'react'
import { Search, MapPin, Clock } from 'lucide-react'

const MOCK_SESSIONS = [
  { id: 'S001', student: 'Temi Adeyemi',   tutor: 'Kolade Okonkwo',  subject: 'Mathematics', status: 'SCHEDULED',  started: '10:00 AM', duration: '45 min', location: 'Lagos, Yaba'      },
  { id: 'S002', student: 'Fatima Musa',    tutor: 'Amaka Eze',       subject: 'Chemistry',   status: 'SCHEDULED',  started: '10:15 AM', duration: '30 min', location: 'Abuja, Wuse'      },
  { id: 'S003', student: 'Grace Nwosu',    tutor: 'Babatunde Osei',  subject: 'Physics',     status: 'PENDING',    started: '—',        duration: '—',      location: 'Lagos, Victoria Island' },
  { id: 'S004', student: 'Emeka Okafor',   tutor: 'Kolade Okonkwo',  subject: 'Maths',       status: 'COMPLETED',  started: '9:00 AM',  duration: '60 min', location: 'Lagos, Surulere'  },
  { id: 'S005', student: 'Tunde Bello',    tutor: 'Ngozi Adeleke',   subject: 'Coding',      status: 'CANCELLED',  started: '—',        duration: '—',      location: 'Remote'            },
  { id: 'S006', student: 'Chidi Obi',      tutor: 'Amaka Eze',       subject: 'Biology',     status: 'ACCEPTED',   started: '—',        duration: '—',      location: 'Ibadan, Bodija'   },
]

const STATUS_STYLE = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  ACCEPTED:  'bg-blue-100 text-blue-700',
  SCHEDULED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-secondary/60',
  CANCELLED: 'bg-red-100 text-red-400',
}

const FILTERS = ['ALL', 'SCHEDULED', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED']

export default function AdminSessions() {
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = MOCK_SESSIONS.filter(s => {
    const matchStatus = filter === 'ALL' || s.status === filter
    const matchQuery  = s.student.toLowerCase().includes(query.toLowerCase()) ||
                        s.tutor.toLowerCase().includes(query.toLowerCase()) ||
                        s.subject.toLowerCase().includes(query.toLowerCase())
    return matchStatus && matchQuery
  })

  const live = MOCK_SESSIONS.filter(s => s.status === 'SCHEDULED').length

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-outfit font-bold text-2xl text-secondary">Sessions</h1>
          <p className="font-inter text-sm text-secondary/50 mt-0.5">{live} sessions live right now</p>
        </div>
        {live > 0 && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-inter text-xs text-green-700 font-semibold">{live} Active</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search student, tutor or subject…"
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
              {f === 'ALL' ? 'All' : f[0] + f.slice(1).toLowerCase()}
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
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">ID</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Student ↔ Tutor</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden md:table-cell">Subject</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Started</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Duration</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden xl:table-cell">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-secondary/40">{s.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-secondary">{s.student}</p>
                    <p className="text-xs text-secondary/45 mt-0.5">with {s.tutor}</p>
                  </td>
                  <td className="px-5 py-3 text-secondary/60 hidden md:table-cell">{s.subject}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {s.status === 'SCHEDULED' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-secondary/40 text-xs hidden lg:table-cell">
                    <span className="flex items-center gap-1"><Clock size={11} />{s.started}</span>
                  </td>
                  <td className="px-5 py-3 text-secondary/40 text-xs hidden lg:table-cell">{s.duration}</td>
                  <td className="px-5 py-3 text-secondary/40 text-xs hidden xl:table-cell">
                    <span className="flex items-center gap-1"><MapPin size={11} />{s.location}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-secondary/40 font-inter text-sm">No sessions match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
