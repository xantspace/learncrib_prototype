import React, { useState, useRef, useEffect } from 'react'
import { Send, Phone, Video, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Placeholder conversation data — Phase 2: real WebSocket + API
const CONVERSATIONS = {
  '1': { name: 'Kolade Okonkwo', initials: 'KO', subject: 'Mathematics', online: true },
  '2': { name: 'Amaka Eze',      initials: 'AE', subject: 'Chemistry',   online: false },
  '3': { name: 'Babatunde Osei', initials: 'BO', subject: 'Physics',     online: false },
}

const SEED_MESSAGES = {
  '1': [
    { id: 1, from: 'tutor', text: 'Hello! I\'m looking forward to our session tomorrow.', time: '10:02 AM' },
    { id: 2, from: 'me',    text: 'Hi! Me too. Can we go through differentiation?', time: '10:05 AM' },
    { id: 3, from: 'tutor', text: 'Absolutely! I\'ll prepare some practice problems for you.', time: '10:06 AM' },
    { id: 4, from: 'me',    text: 'Perfect, thank you!', time: '10:07 AM' },
  ],
  '2': [
    { id: 1, from: 'tutor', text: 'Hi! Ready for our chemistry session?', time: '3:00 PM' },
    { id: 2, from: 'me',    text: 'Yes! Can we cover organic reactions?', time: '3:02 PM' },
    { id: 3, from: 'tutor', text: 'See you Thursday at 4 PM!', time: '3:05 PM' },
  ],
  '3': [
    { id: 1, from: 'tutor', text: 'Great session today, keep it up!', time: '2:45 PM' },
  ],
}

export default function Messages() {
  const navigate   = useNavigate()
  const { id }     = useParams()
  const { user }   = useAuthStore()

  const conv       = CONVERSATIONS[id] || CONVERSATIONS['1']
  const seedMsgs   = SEED_MESSAGES[id]  || SEED_MESSAGES['1']

  const [input,    setInput]    = useState('')
  const [messages, setMessages] = useState(seedMsgs)
  const bottomRef  = useRef(null)

  // Reset when conversation changes
  useEffect(() => {
    setMessages(SEED_MESSAGES[id] || SEED_MESSAGES['1'])
    setInput('')
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    setMessages(m => [...m, {
      id:   Date.now(),
      from: 'me',
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  return (
    <div className="flex flex-col" style={{ height: '100svh' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-4 border-b border-secondary/10">
        <button onClick={() => navigate('/messages')}
          className="w-9 h-9 rounded-2xl bg-white/80 border border-secondary/10 flex items-center justify-center">
          <ArrowLeft size={16} className="text-secondary/60" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-sm">
          {conv.initials}
        </div>
        <div className="flex-1">
          <p className="font-outfit font-semibold text-sm text-secondary">{conv.name}</p>
          <p className={`font-inter text-xs ${conv.online ? 'text-success' : 'text-secondary/40'}`}>
            {conv.online ? 'Online' : conv.subject}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Phone size={15} className="text-secondary/60" />
          </button>
          <button className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Video size={15} className="text-secondary/60" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
              msg.from === 'me'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-white/80 backdrop-blur-glass border border-white/45 text-secondary rounded-bl-sm'
            }`}>
              <p className="font-inter text-sm leading-relaxed">{msg.text}</p>
              <p className={`font-inter text-[0.65rem] mt-1 ${msg.from === 'me' ? 'text-white/60' : 'text-secondary/40'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-24 pt-3 border-t border-secondary/10 flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 py-3 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center transition-all disabled:opacity-40 hover:shadow-glow"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  )
}
