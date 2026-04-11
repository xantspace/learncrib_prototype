import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, Calendar, MessageSquare, User,
  LayoutDashboard, ClipboardList, Wallet,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const studentNav = [
  { to: '/student/dashboard',  icon: Home,           label: 'Home' },
  { to: '/student/sessions',   icon: Calendar,       label: 'Sessions' },
  { to: '/messages',           icon: MessageSquare,  label: 'Messages' },
  { to: '/student/profile',    icon: User,           label: 'Profile' },
]

const tutorNav = [
  { to: '/tutor/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tutor/sessions',     icon: ClipboardList,   label: 'Sessions' },
  { to: '/tutor/availability', icon: Calendar,        label: 'Schedule' },
  { to: '/tutor/earnings',     icon: Wallet,          label: 'Earnings' },
  { to: '/tutor/profile',      icon: User,            label: 'Profile' },
]

export default function BottomNav() {
  const { user } = useAuthStore()
  const items = user?.role === 'TUTOR' ? tutorNav : studentNav

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
      bg-white border-t border-secondary/10
      flex justify-around items-center px-4 pb-5 pt-3">
      {items.map(({ to, icon: Icon, label }) => (
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
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
