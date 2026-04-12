import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, LogOut, Star, ChevronRight, User, Lock, Bell, Building2, HelpCircle, Settings } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

export default function TutorProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
  const name     = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  const menuItems = [
    { icon: User,       label: 'Personal Information', sub: 'Name, email, phone',        to: '/settings/profile' },
    { icon: Lock,       label: 'Security',             sub: 'Password & account safety', to: '/settings/security' },
    { icon: Bell,       label: 'Notifications',        sub: 'Alerts and reminders',      to: '/settings/notifications' },
    { icon: Building2,  label: 'Bank Account',         sub: 'Payout bank details',       to: '/settings/bank' },
    { icon: Settings,   label: 'Preferences',          sub: 'Dark mode & language',      to: '/settings/preferences' },
    { icon: HelpCircle, label: 'Help & Support',       sub: 'FAQs and live chat',        to: '/help' },
  ]

  return (
    <div className="pb-6">
      <div className="px-5 pt-12">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-outfit font-bold text-2xl text-secondary">Profile</h1>
          <button
            onClick={() => navigate('/tutor/profile/edit')}
            className="w-9 h-9 rounded-2xl bg-primary-light flex items-center justify-center"
          >
            <Edit3 size={16} className="text-primary" />
          </button>
        </div>

        {/* Avatar card */}
        <GlassCard className="p-5 flex items-center gap-4 mb-5" hover={false}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-outfit font-bold text-lg text-secondary truncate">{name}</h2>
            <p className="font-inter text-sm text-secondary/50 truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">Tutor</Badge>
              {user?.verification_status === 'APPROVED' && <Badge variant="success">Verified ✓</Badge>}
            </div>
          </div>
        </GlassCard>

        {/* Rating */}
        {user?.rating > 0 && (
          <GlassCard className="p-4 flex items-center gap-3 mb-4" hover={false}>
            <Star size={18} className="text-accent fill-current" />
            <div className="flex-1">
              <p className="font-outfit font-bold text-lg text-secondary">{user.rating}</p>
              <p className="font-inter text-xs text-secondary/50">Average rating · {user.total_reviews || 0} reviews</p>
            </div>
          </GlassCard>
        )}

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

          <GlassCard
            onClick={() => { logout(); navigate('/login', { replace: true }) }}
            className="p-4 flex items-center gap-4 mt-2"
          >
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
