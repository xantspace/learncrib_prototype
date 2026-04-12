import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'

// Placeholder conversations — Phase 2 will wire real WebSocket + API
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name:    'Kolade Okonkwo',
    initials:'KO',
    subject: 'Mathematics',
    last:    'I\'ll prepare some practice problems for you.',
    time:    '10:06 AM',
    unread:  2,
    online:  true,
  },
  {
    id: '2',
    name:    'Amaka Eze',
    initials:'AE',
    subject: 'Chemistry',
    last:    'See you Thursday at 4 PM!',
    time:    'Yesterday',
    unread:  0,
    online:  false,
  },
  {
    id: '3',
    name:    'Babatunde Osei',
    initials:'BO',
    subject: 'Physics',
    last:    'Great session today, keep it up!',
    time:    'Mon',
    unread:  0,
    online:  false,
  },
]

export default function MessagesInbox() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div>
      <PageHeader title="Messages" back={false} />

      <div className="px-5 flex flex-col gap-3">
        {MOCK_CONVERSATIONS.map(conv => (
          <GlassCard
            key={conv.id}
            className="p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate(`/messages/${conv.id}`)}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, hsl(220,60%,55%), hsl(220,40%,40%))' }}
              >
                {conv.initials}
              </div>
              {conv.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-white" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-outfit font-semibold text-sm text-secondary">{conv.name}</p>
                <p className="font-inter text-[0.65rem] text-secondary/40 flex-shrink-0">{conv.time}</p>
              </div>
              <p className="font-inter text-xs text-secondary/40 mb-0.5">{conv.subject}</p>
              <p className="font-inter text-xs text-secondary/55 truncate">{conv.last}</p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center font-inter text-[0.65rem] text-white font-bold flex-shrink-0">
                {conv.unread}
              </span>
            )}
          </GlassCard>
        ))}

        {MOCK_CONVERSATIONS.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-outfit font-semibold text-secondary">No messages yet</p>
            <p className="font-inter text-sm text-secondary/50 mt-1">
              Book a session to start chatting with a tutor
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
