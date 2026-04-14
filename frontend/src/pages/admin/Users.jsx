import React, { useState, useEffect } from 'react'
import { Search, UserCheck, UserX } from 'lucide-react'
import { adminAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

export default function AdminUsers() {
  const { showToast } = useUIStore()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')
  const [filter,  setFilter]  = useState('ALL')

  useEffect(() => {
    adminAPI.getUsers()
      .then(r => setUsers(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => showToast('Failed to load users', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const name = `${u.first_name} ${u.last_name}`
    const matchRole  = filter === 'ALL' || u.role === filter
    const matchQuery = name.toLowerCase().includes(query.toLowerCase()) ||
                       u.email.toLowerCase().includes(query.toLowerCase())
    return matchRole && matchQuery
  })

  const toggle = async (u) => {
    const next = u.is_active === false
    try {
      await adminAPI.patchUser(u.id, { is_active: next })
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: next } : x))
      showToast(next ? 'User activated' : 'User suspended', 'success')
    } catch {
      showToast('Action failed', 'error')
    }
  }

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
        {['ALL', 'STUDENT', 'TUTOR'].map(f => (
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Name</th>
                  <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 font-semibold text-secondary/50 font-inter text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => {
                  const name   = `${u.first_name} ${u.last_name}`
                  const active = u.is_active !== false
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center font-outfit font-bold text-primary text-xs flex-shrink-0">
                            {`${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase()}
                          </div>
                          <span className="font-medium text-secondary">{name}</span>
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
                          active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
                        }`}>
                          {active ? 'active' : 'suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggle(u)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                              active
                                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {active ? <><UserX size={13} /> Suspend</> : <><UserCheck size={13} /> Activate</>}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-secondary/40 font-inter text-sm">No users match your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
