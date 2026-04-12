import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Settings } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'

export default function StudentProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
  const name     = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  const menuItems = [
    { icon: User,       label: 'Personal Information', sub: 'Name, email, phone',        to: '/settings/profile' },
    { icon: Lock,       label: 'Security',             sub: 'Password & account safety', to: '/settings/security' },
    { icon: Bell,       label: 'Notifications',        sub: 'Alerts and reminders',      to: '/settings/notifications' },
    { icon: CreditCard, label: 'Payment Methods',      sub: 'Saved cards & escrow',      to: '/settings/payment' },
    { icon: Settings,   label: 'Preferences',          sub: 'Dark mode & language',      to: '/settings/preferences' },
    { icon: HelpCircle, label: 'Help & Support',       sub: 'FAQs and live chat',        to: '/help' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-12">
        <h1 className="font-outfit font-bold text-2xl text-secondary mb-5">Profile</h1>

        {/* Avatar card */}
        <GlassCard className="p-5 flex items-center gap-4 mb-6" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-xl flex-shrink-0">
            {initials || 'ME'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-outfit font-bold text-lg text-secondary truncate">{name || 'Student'}</h2>
            <p className="font-inter text-sm text-secondary/50 truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold">
              Student
            </span>
          </div>
          <button
            onClick={() => navigate('/settings/profile')}
            className="w-9 h-9 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0"
          >
            <User size={15} className="text-primary" />
          </button>
        </GlassCard>

        {/* Menu */}
        <div className="flex flex-col gap-2">
          {menuItems.map(({ icon: Icon, label, sub, to }) => (
            <GlassCard key={label} onClick={() => navigate(to)} className="p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm text-secondary font-medium">{label}</p>
                <p className="font-inter text-xs text-secondary/45 truncate">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-secondary/30 flex-shrink-0" />
            </GlassCard>
          ))}

          <GlassCard onClick={handleLogout} className="p-4 flex items-center gap-4 mt-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut size={16} className="text-red-500" />
            </div>
            <span className="font-inter text-sm text-red-500 font-medium">Log Out</span>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
