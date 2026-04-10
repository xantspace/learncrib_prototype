import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit3, LogOut, Star, ChevronRight, User, Lock, Bell, CreditCard, HelpCircle } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

export default function TutorProfile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  return (
    <div>
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-outfit font-bold text-2xl text-secondary">Profile</h1>
          <button onClick={() => navigate('/tutor/profile/edit')} className="w-9 h-9 rounded-2xl bg-primary-light flex items-center justify-center">
            <Edit3 size={16} className="text-primary" />
          </button>
        </div>

        <GlassCard className="p-5 flex items-center gap-4 mb-5" hover={false}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-xl"
            style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
            {initials}
          </div>
          <div>
            <h2 className="font-outfit font-bold text-lg text-secondary">{name}</h2>
            <p className="font-inter text-sm text-secondary/50">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">Tutor</Badge>
              {user?.verification_status === 'APPROVED' && <Badge variant="success">Verified ✓</Badge>}
            </div>
          </div>
        </GlassCard>

        {user?.rating > 0 && (
          <GlassCard className="p-4 flex items-center gap-3 mb-4" hover={false}>
            <Star size={18} className="text-accent fill-current" />
            <div className="flex-1">
              <p className="font-outfit font-bold text-lg text-secondary">{user.rating}</p>
              <p className="font-inter text-xs text-secondary/50">Average rating</p>
            </div>
          </GlassCard>
        )}

        {[
          { icon: User,       label: 'Personal Information', to: '/settings' },
          { icon: Lock,       label: 'Security',             to: '/settings' },
          { icon: Bell,       label: 'Notifications',        to: '/settings' },
          { icon: CreditCard, label: 'Bank Account',         to: '/settings' },
          { icon: HelpCircle, label: 'Help & Support',       to: '/help' },
        ].map(({ icon: Icon, label, to }) => (
          <GlassCard key={label} onClick={() => navigate(to)} className="p-4 flex items-center gap-4 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
              <Icon size={16} className="text-primary" />
            </div>
            <span className="flex-1 font-inter text-sm text-secondary">{label}</span>
            <ChevronRight size={16} className="text-secondary/30" />
          </GlassCard>
        ))}

        <GlassCard onClick={() => { logout(); navigate('/login', { replace: true }) }} className="p-4 flex items-center gap-4 mt-2">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut size={16} className="text-red-500" />
          </div>
          <span className="font-inter text-sm text-red-500 font-medium">Log Out</span>
        </GlassCard>
      </div>
    </div>
  )
}
