import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { useAuthStore } from '@/store/authStore'

export default function StudentProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  const menuItems = [
    { icon: User,       label: 'Personal Information', to: '/settings' },
    { icon: Lock,       label: 'Security',             to: '/settings' },
    { icon: Bell,       label: 'Notifications',        to: '/settings' },
    { icon: CreditCard, label: 'Payment Methods',      to: '/settings' },
    { icon: HelpCircle, label: 'Help & Support',       to: '/help' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div>
      <div className="px-5 pt-12 pb-6">
        <h1 className="font-outfit font-bold text-2xl text-secondary mb-5">Profile</h1>
        <GlassCard className="p-5 flex items-center gap-4 mb-6" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-xl">
            {initials || 'ME'}
          </div>
          <div>
            <h2 className="font-outfit font-bold text-lg text-secondary">{name || 'Student'}</h2>
            <p className="font-inter text-sm text-secondary/50">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-semibold">
              Student
            </span>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-2">
          {menuItems.map(({ icon: Icon, label, to }) => (
            <GlassCard
              key={label}
              onClick={() => navigate(to)}
              className="p-4 flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
                <Icon size={16} className="text-primary" />
              </div>
              <span className="flex-1 font-inter text-sm text-secondary">{label}</span>
              <ChevronRight size={16} className="text-secondary/30" />
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
