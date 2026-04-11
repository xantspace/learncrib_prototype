import React, { useState } from 'react'
import { Search, CheckCircle, XCircle, Circle } from 'lucide-react'

const MOCK_TUTORS = [
  { id: 1, name: 'Kolade Okonkwo',  email: 'kolade@mail.com',  subjects: ['Maths','Physics'],       rate: 3500, rating: 4.9, sessions: 42, status: 'approved',  online: true,  available: true  },
  { id: 2, name: 'Amaka Eze',       email: 'amaka@mail.com',   subjects: ['Chemistry','Biology'],   rate: 3000, rating: 4.7, sessions: 28, status: 'approved',  online: false, available: true  },
  { id: 3, name: 'Babatunde Osei',  email: 'baba@mail.com',    subjects: ['Physics','Maths'],       rate: 4000, rating: 4.8, sessions: 61, status: 'approved',  online: true,  available: false },
  { id: 4, name: 'Adaeze Nnoli',    email: 'adaeze@mail.com',  subjects: ['English','Literature'],  rate: 2500, rating: 0,   sessions: 0,  status: 'pending',   online: false, available: false },
  { id: 5, name: 'Emeka Okafor',    email: 'emeka@mail.com',   subjects: ['Economics','Commerce'],  rate: 2800, rating: 4.2, sessions: 15, status: 'disabled',  online: false, available: false },
  { id: 6, name: 'Ngozi Adeleke',   email: 'ngozi@mail.com',   subjects: ['Coding','Design'],       rate: 5000, rating: 0,   sessions: 0,  status: 'pending',   online: false, available: false },
]

const STATUS_STYLE = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  disabled: 'bg-red-100 text-red-500',
}

export default function AdminTutors() {
  const [tutors, setTutors] = useState(MOCK_TUTORS)
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = tutors.filter(t => {
    const matchStatus = filter === 'ALL' || t.status === filter.toLowerCase()
    const matchQuery  = t.name.toLowerCase().includes(query.toLowerCase()) ||
                        t.subjects.some(s => s.toLowerCase().includes(query.toLowerCase()))
    return matchStatus && matchQuery
  })

  const setStatus = (id, status) =>
    setTutors(prev => prev.map(t => t.id === id ? { ...t, status } : t))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Tutors</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">
          {tutors.filter(t => t.status === 'pending').length} pending approval
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
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
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-sm">
                    {t.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${t.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
                <div>
                  <p className="font-outfit font-semibold text-sm text-secondary">{t.name}</p>
                  <p className="font-inter text-xs text-secondary/45">{t.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold flex-shrink-0 ${STATUS_STYLE[t.status]}`}>
                {t.status}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {t.subjects.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-gray-100 text-secondary/60 text-xs font-medium">{s}</span>
              ))}
            </div>
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
                <button
                  onClick={() => setStatus(t.id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                >
                  <CheckCircle size={13} /> Approve
                </button>
              )}
              {t.status === 'approved' && (
                <button
                  onClick={() => setStatus(t.id, 'disabled')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <XCircle size={13} /> Disable
                </button>
              )}
              {t.status === 'disabled' && (
                <button
                  onClick={() => setStatus(t.id, 'approved')}
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
