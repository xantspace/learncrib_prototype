import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, CreditCard,
  AlertTriangle, LogOut, Menu, X, GraduationCap,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Overview',  exact: true },
  { to: '/admin/users',    icon: Users,           label: 'Users'             },
  { to: '/admin/tutors',   icon: GraduationCap,   label: 'Tutors'            },
  { to: '/admin/sessions', icon: BookOpen,        label: 'Sessions'          },
  { to: '/admin/payments', icon: CreditCard,      label: 'Payments'          },
  { to: '/admin/issues',   icon: AlertTriangle,   label: 'Issues'            },
]

export default function AdminShell({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter">

      {/* ── Sidebar (desktop) / Drawer (mobile) ── */}
      <>
        {/* Mobile overlay */}
        {open && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />
        )}

        <aside className={`
          fixed top-0 left-0 h-full w-60 z-40 flex flex-col
          bg-secondary text-white
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <img src="/assets/img/logo_icon.png" alt="LearnCrib" className="w-9 h-9 rounded-xl" />
            <div>
              <p className="font-outfit font-bold text-sm text-white">LearnCrib</p>
              <p className="font-inter text-[0.65rem] text-white/40 uppercase tracking-widest">Admin</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto lg:hidden">
              <X size={18} className="text-white/60" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            {NAV.map(({ to, icon: Icon, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'}
                `}
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + logout */}
          <div className="px-4 py-4 border-t border-white/10">
            <p className="font-inter text-xs text-white/40 mb-1">Signed in as</p>
            <p className="font-outfit font-semibold text-sm text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <button
              onClick={handleLogout}
              className="mt-3 flex items-center gap-2 text-white/50 hover:text-white text-xs transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Menu size={18} className="text-secondary" />
          </button>
          <p className="font-outfit font-bold text-secondary">Admin Panel</p>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  )
}
