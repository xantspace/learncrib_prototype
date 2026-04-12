import React, { useState } from 'react'
import { Search, UserCheck, UserX, ChevronDown } from 'lucide-react'

const MOCK_USERS = [
  { id: 1, name: 'Temi Adeyemi',    email: 'temi@mail.com',    role: 'STUDENT', status: 'active',    joined: 'Jan 12, 2025' },
  { id: 2, name: 'Kolade Okonkwo',  email: 'kolade@mail.com',  role: 'TUTOR',   status: 'active',    joined: 'Jan 8, 2025'  },
  { id: 3, name: 'Amaka Eze',       email: 'amaka@mail.com',   role: 'TUTOR',   status: 'active',    joined: 'Feb 2, 2025'  },
  { id: 4, name: 'Tunde Bello',     email: 'tunde@mail.com',   role: 'STUDENT', status: 'suspended', joined: 'Feb 14, 2025' },
  { id: 5, name: 'Fatima Musa',     email: 'fatima@mail.com',  role: 'STUDENT', status: 'active',    joined: 'Mar 1, 2025'  },
  { id: 6, name: 'Emeka Okafor',    email: 'emeka@mail.com',   role: 'TUTOR',   status: 'suspended', joined: 'Mar 5, 2025'  },
  { id: 7, name: 'Grace Nwosu',     email: 'grace@mail.com',   role: 'STUDENT', status: 'active',    joined: 'Mar 20, 2025' },
  { id: 8, name: 'Babatunde Osei',  email: 'baba@mail.com',    role: 'TUTOR',   status: 'active',    joined: 'Apr 1, 2025'  },
]

export default function AdminUsers() {
  const [users,  setUsers]  = useState(MOCK_USERS)
  const [query,  setQuery]  = useState('')
  const [filter, setFilter] = useState('ALL')

  const filtered = users.filter(u => {
    const matchRole  = filter === 'ALL' || u.role === filter
    const matchQuery = u.name.toLowerCase().includes(query.toLowerCase()) ||
                       u.email.toLowerCase().includes(query.toLowerCase())
    return matchRole && matchQuery
  })

  const toggle = (id) => setUsers(prev => prev.map(u =>
    u.id === id ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
  ))

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Users</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">{users.length} total registered users</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-primary"
          />
        </div>
        {['ALL','STUDENT','TUTOR'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-secondary/60 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f === 'ALL' ? 'All Users' : f[0] + f.slice(1).toLowerCase() + 's'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-xs flex-shrink-0">
                        {u.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <span className="font-medium text-secondary">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-secondary/55 hidden md:table-cell">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${
                      u.role === 'TUTOR' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-secondary/60'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${
                      u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-secondary/40 text-xs hidden lg:table-cell">{u.joined}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggle(u.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        u.status === 'active'
                          ? 'bg-red-50 text-red-500 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {u.status === 'active'
                        ? <><UserX size={13} /> Suspend</>
                        : <><UserCheck size={13} /> Activate</>
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-secondary/40 font-inter text-sm">No users match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
