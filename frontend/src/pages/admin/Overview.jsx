import React from 'react'
import { Users, GraduationCap, BookOpen, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react'

const STATS = [
  { label: 'Total Users',      value: '1,284', delta: '+12 today',  icon: Users,         color: 'bg-blue-50 text-blue-600'   },
  { label: 'Active Tutors',    value: '94',    delta: '8 pending',  icon: GraduationCap, color: 'bg-primary-light text-primary' },
  { label: 'Live Sessions',    value: '17',    delta: 'right now',  icon: BookOpen,      color: 'bg-green-50 text-green-600' },
  { label: 'Escrow Balance',   value: '₦482k', delta: '23 pending', icon: CreditCard,    color: 'bg-yellow-50 text-yellow-600' },
  { label: 'Open Issues',      value: '5',     delta: '2 urgent',   icon: AlertTriangle, color: 'bg-red-50 text-red-500'     },
  { label: 'Revenue (Month)',  value: '₦72k',  delta: '+18%',       icon: TrendingUp,    color: 'bg-purple-50 text-purple-600' },
]

const RECENT_ACTIVITY = [
  { time: '2m ago',  text: 'New tutor application — Adaeze Nnoli',         type: 'tutor'   },
  { time: '5m ago',  text: 'Session completed — Maths with Kolade Okonkwo', type: 'session' },
  { time: '12m ago', text: 'Dispute raised — Session #A3F9',                type: 'issue'   },
  { time: '18m ago', text: 'Payment verified — ₦3,200 escrow',              type: 'payment' },
  { time: '34m ago', text: 'User suspended — tunde@mail.com',               type: 'user'    },
]

const TYPE_COLOR = {
  tutor:   'bg-primary-light text-primary',
  session: 'bg-green-100 text-green-600',
  issue:   'bg-red-100 text-red-500',
  payment: 'bg-yellow-100 text-yellow-600',
  user:    'bg-gray-100 text-secondary/60',
}

export default function AdminOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary">Overview</h1>
        <p className="font-inter text-sm text-secondary/50 mt-0.5">Platform snapshot — live data</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={18} />
              </div>
              <p className="font-outfit font-bold text-xl text-secondary">{s.value}</p>
              <p className="font-inter text-xs text-secondary/50 mt-0.5">{s.label}</p>
              <p className="font-inter text-[0.65rem] text-secondary/35 mt-1">{s.delta}</p>
            </div>
          )
        })}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-outfit font-semibold text-base text-secondary">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_ACTIVITY.map((a, i) => (
            <div key={i} className="px-5 py-3 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLOR[a.type].split(' ')[0]}`} />
              <p className="font-inter text-sm text-secondary flex-1">{a.text}</p>
              <span className="font-inter text-xs text-secondary/35 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
