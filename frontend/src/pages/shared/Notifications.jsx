import React, { useState, useRef } from 'react'
import { Calendar, MessageCircle, DollarSign, Bell, Check, Trash2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'

const INITIAL = [
  { id: 1, type: 'booking',  icon: Calendar,       color: 'bg-primary-light text-primary',   title: 'Session Accepted',       body: 'Kolade accepted your session request.',           time: '2m ago',  unread: true  },
  { id: 2, type: 'message',  icon: MessageCircle,  color: 'bg-primary-light text-primary',   title: 'New Message',            body: 'Fatima Bello sent you a message.',                time: '15m ago', unread: true  },
  { id: 3, type: 'payment',  icon: DollarSign,     color: 'bg-green-100 text-green-600',     title: 'Payment Confirmed',      body: 'Your payment of ₦2,750 is secured in escrow.',   time: '1h ago',  unread: false },
  { id: 4, type: 'booking',  icon: Calendar,       color: 'bg-yellow-100 text-yellow-600',   title: 'Session Reminder',       body: 'Your session with Kolade is tomorrow at 10 AM.',  time: '3h ago',  unread: false },
  { id: 5, type: 'payment',  icon: DollarSign,     color: 'bg-green-100 text-green-600',     title: 'Payout Sent',            body: '₦5,500 has been sent to your bank account.',      time: 'Yesterday',unread: false },
]

export default function Notifications() {
  const [items, setItems] = useState(INITIAL)
  const unreadCount = items.filter(n => n.unread).length

  const markRead  = (id) => setItems(p => p.map(n => n.id === id ? { ...n, unread: false } : n))
  const markAllRead = () => setItems(p => p.map(n => ({ ...n, unread: false })))
  const remove    = (id) => setItems(p => p.filter(n => n.id !== id))

  return (
    <div className="pb-8">
      <PageHeader title="Notifications" />

      {/* Mark all read */}
      {unreadCount > 0 && (
        <div className="px-5 flex items-center justify-between mb-3">
          <p className="font-inter text-xs text-secondary/50">{unreadCount} unread</p>
          <button onClick={markAllRead} className="font-inter text-xs text-primary font-semibold">
            Mark all as read
          </button>
        </div>
      )}

      <div className="px-5 flex flex-col gap-2">
        {items.length === 0 && (
          <div className="text-center py-16">
            <Bell size={40} className="text-secondary/20 mx-auto mb-3" />
            <p className="font-outfit font-semibold text-secondary">All caught up!</p>
            <p className="font-inter text-sm text-secondary/50 mt-1">No notifications right now</p>
          </div>
        )}
        {items.map(n => (
          <SwipeableNotification
            key={n.id}
            notification={n}
            onMarkRead={() => markRead(n.id)}
            onDelete={() => remove(n.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SwipeableNotification({ notification: n, onMarkRead, onDelete }) {
  const [offset,   setOffset]   = useState(0)
  const [swiping,  setSwiping]  = useState(false)
  const startX    = useRef(null)
  const Icon = n.icon

  const THRESHOLD = 72  // px to reveal action
  const DELETE_THRESHOLD = 180

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    setSwiping(true)
  }

  const onTouchMove = (e) => {
    if (startX.current === null) return
    const dx = e.touches[0].clientX - startX.current
    setOffset(Math.max(-DELETE_THRESHOLD, Math.min(THRESHOLD, dx)))
  }

  const onTouchEnd = () => {
    setSwiping(false)
    if (offset < -DELETE_THRESHOLD + 20) {
      onDelete()
    } else if (offset > THRESHOLD - 10 && n.unread) {
      onMarkRead()
      setOffset(0)
    } else {
      setOffset(0)
    }
    startX.current = null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex">
        {/* Left: mark read (swipe right) */}
        <div className="flex items-center justify-start pl-4 bg-primary/10 flex-1">
          <div className="flex items-center gap-1.5 text-primary">
            <Check size={16} />
            <span className="font-inter text-xs font-semibold">Read</span>
          </div>
        </div>
        {/* Right: delete (swipe left) */}
        <div className="flex items-center justify-end pr-4 bg-red-50 flex-1">
          <div className="flex items-center gap-1.5 text-red-500">
            <span className="font-inter text-xs font-semibold">Delete</span>
            <Trash2 size={16} />
          </div>
        </div>
      </div>

      {/* Foreground card */}
      <div
        style={{ transform: `translateX(${offset}px)`, transition: swiping ? 'none' : 'transform 0.25s ease' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`relative ${n.unread ? 'bg-white border border-primary/15' : 'bg-white/80 border border-secondary/8'} rounded-2xl`}
      >
        <div className="p-4 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <p className="font-outfit font-semibold text-sm text-secondary">{n.title}</p>
              <span className="font-inter text-xs text-secondary/40 flex-shrink-0 ml-2">{n.time}</span>
            </div>
            <p className="font-inter text-xs text-secondary/60 leading-relaxed">{n.body}</p>
          </div>
          {n.unread && (
            <span className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0 mt-1 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}
