import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, Calendar, MessageSquare, User,
  LayoutDashboard, ClipboardList, Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const studentNav = [
  { to: '/student/dashboard',  icon: Home,           label: 'Home',     badge: false },
  { to: '/student/sessions',   icon: Calendar,       label: 'Sessions', badge: false },
  { to: '/messages',           icon: MessageSquare,  label: 'Messages', badge: true  },
  { to: '/student/profile',    icon: User,           label: 'Profile',  badge: false },
]

const tutorNav = [
  { to: '/tutor/dashboard',    icon: LayoutDashboard, label: 'Dashboard', badge: false },
  { to: '/tutor/sessions',     icon: ClipboardList,   label: 'Sessions',  badge: true  },
  { to: '/tutor/availability', icon: Calendar,        label: 'Schedule',  badge: false },
  { to: '/tutor/earnings',     icon: Wallet,          label: 'Earnings',  badge: false },
  { to: '/tutor/profile',      icon: User,            label: 'Profile',   badge: false },
]

export default function BottomNav() {
  const { user } = useAuthStore()
  const items = user?.role === 'TUTOR' ? tutorNav : studentNav

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
      bg-white border-t border-secondary/10
      flex justify-around items-center px-4 pb-5 pt-3">
      {items.map(({ to, icon: Icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center gap-0.5 cursor-pointer transition-colors duration-200
            font-inter text-[0.7rem]
            ${isActive ? 'text-primary' : 'text-secondary/45 hover:text-secondary/70'}
          `}
        >
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent border border-white" />
                )}
              </span>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
