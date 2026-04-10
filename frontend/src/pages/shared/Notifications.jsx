import React from 'react'
import { Calendar, MessageCircle, DollarSign, Bell } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'booking',  icon: Calendar,       color: 'bg-primary-light text-primary', title: 'Session Request',        body: 'Kolade accepted your session request.',         time: '2m ago',  unread: true },
  { id: 2, type: 'message',  icon: MessageCircle,  color: 'bg-primary-light text-primary', title: 'New Message',           body: 'Fatima Bello sent you a message.',              time: '15m ago', unread: true },
  { id: 3, type: 'payment',  icon: DollarSign,     color: 'bg-green-100 text-green-600',   title: 'Payment Confirmed',     body: 'Your payment of ₦2,750 is secured in escrow.', time: '1h ago',  unread: false },
  { id: 4, type: 'booking',  icon: Calendar,       color: 'bg-yellow-100 text-yellow-600', title: 'Session Reminder',      body: 'Your session with Kolade is tomorrow at 10 AM.', time: '3h ago', unread: false },
]

export default function Notifications() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="px-5 flex flex-col gap-2">
        {MOCK_NOTIFICATIONS.map(n => {
          const Icon = n.icon
          return (
            <GlassCard key={n.id} className={`p-4 flex items-start gap-4 ${n.unread ? 'border border-primary/20' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-outfit font-semibold text-sm text-secondary">{n.title}</p>
                  <span className="font-inter text-xs text-secondary/40">{n.time}</span>
                </div>
                <p className="font-inter text-xs text-secondary/60 mt-0.5 leading-relaxed">{n.body}</p>
              </div>
              {n.unread && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />}
            </GlassCard>
          )
        })}
        {MOCK_NOTIFICATIONS.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="text-secondary/20 mx-auto mb-3" />
            <p className="font-outfit font-semibold text-secondary">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
