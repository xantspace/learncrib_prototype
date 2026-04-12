import React from 'react'
import { Calendar, MessageCircle, DollarSign, Gift, Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import { useUIStore } from '@/store/uiStore'

const PREFS = [
  {
    key:   'sessionReminders',
    icon:  Calendar,
    color: 'bg-primary-light text-primary',
    label: 'Session Reminders',
    sub:   'Get notified 1 hour before your sessions',
  },
  {
    key:   'paymentAlerts',
    icon:  DollarSign,
    color: 'bg-green-100 text-green-600',
    label: 'Payment Alerts',
    sub:   'Escrow holds, releases, and payout notifications',
  },
  {
    key:   'newMessages',
    icon:  MessageCircle,
    color: 'bg-primary-light text-primary',
    label: 'New Messages',
    sub:   'Alerts when you receive a message',
  },
  {
    key:   'promotions',
    icon:  Gift,
    color: 'bg-yellow-100 text-yellow-600',
    label: 'Promotions & Updates',
    sub:   'Offers, new features, and platform news',
  },
]

export default function NotificationPrefs() {
  const { notificationPrefs, setNotificationPref } = useUIStore()

  return (
    <div className="pb-10">
      <PageHeader title="Notifications" subtitle="Choose what to be notified about" />
      <div className="px-5 flex flex-col gap-3">

        <GlassCard className="p-4 flex items-center gap-3 mb-1" hover={false}>
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
            <Bell size={16} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-outfit font-semibold text-sm text-secondary">Push Notifications</p>
            <p className="font-inter text-xs text-secondary/50">Enable system push notifications to receive alerts</p>
          </div>
        </GlassCard>

        {PREFS.map(({ key, icon: Icon, color, label, sub }) => (
          <GlassCard key={key} className="p-4 flex items-center gap-4" hover={false}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-outfit font-semibold text-sm text-secondary">{label}</p>
              <p className="font-inter text-xs text-secondary/50 mt-0.5">{sub}</p>
            </div>
            <Toggle
              checked={notificationPrefs[key]}
              onChange={() => setNotificationPref(key, !notificationPrefs[key])}
            />
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${
        checked ? 'bg-primary' : 'bg-secondary/15'
      }`}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
        style={{ transform: checked ? 'translateX(23px)' : 'translateX(3px)' }}
      />
    </div>
  )
}
