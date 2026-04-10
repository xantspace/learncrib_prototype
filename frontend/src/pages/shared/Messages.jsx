import React, { useState, useRef, useEffect } from 'react'
import { Send, Phone, Video, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Placeholder UI — WebSocket/real messages to be connected in Phase 2
const MOCK_MESSAGES = [
  { id: 1, from: 'tutor', text: 'Hello! I\'m looking forward to our session tomorrow.', time: '10:02 AM' },
  { id: 2, from: 'me',    text: 'Hi! Me too. Can we go through differentiation?', time: '10:05 AM' },
  { id: 3, from: 'tutor', text: 'Absolutely! I\'ll prepare some practice problems for you.', time: '10:06 AM' },
  { id: 4, from: 'me',    text: 'Perfect, thank you!', time: '10:07 AM' },
]

export default function Messages() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [input,   setInput]    = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const bottomRef = useRef(null)

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
    <div className="flex flex-col h-svh">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-4 border-b border-secondary/10">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-2xl bg-white/80 border border-secondary/10 flex items-center justify-center">
          <ArrowLeft size={16} className="text-secondary/60" />
        </button>
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-sm">
          KO
        </div>
        <div className="flex-1">
          <p className="font-outfit font-semibold text-sm text-secondary">Kolade Okonkwo</p>
          <p className="font-inter text-xs text-success">Online</p>
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
      <div className="px-4 pb-8 pt-3 border-t border-secondary/10 flex items-center gap-3">
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
