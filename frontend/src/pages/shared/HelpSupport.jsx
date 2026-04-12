import React, { useState, useRef } from 'react'
import { Search, Plus, Minus, MessageSquareMore, BookOpen, Shield, CreditCard, Users } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'

const FAQS = [
  { q: 'How does the escrow payment system work?',   a: 'When you pay for a session, funds are held securely. They\'re released to your tutor 48 hours after session completion — unless you raise a dispute.' },
  { q: 'What happens if my tutor doesn\'t show up?', a: 'You\'ll receive a full refund within 24 hours. The tutor will also face a penalty and potential suspension.' },
  { q: 'Can I cancel a booking?',                    a: 'Yes. Cancellations more than 24 hours in advance get a 100% refund. Late cancellations (<24hrs) receive only a 50% refund.' },
  { q: 'How do I become a verified tutor?',          a: 'Complete your profile and our team will manually verify your credentials within 2–3 business days.' },
  { q: 'When do tutors receive payment?',            a: 'Tutors are paid every Friday at 10 AM, for all sessions completed and confirmed that week.' },
  { q: 'How do I dispute a session?',                a: 'After a session, you have 48 hours to tap "Report an Issue" from your sessions page. Our team reviews all disputes manually.' },
  { q: 'Is my payment information secure?',          a: 'Yes. Payments are processed by Paystack, a PCI-DSS certified provider. LearnCrib never stores your card details.' },
]

const GUIDES = [
  { icon: BookOpen,    color: 'bg-primary-light text-primary',  title: 'Booking Your First Session', desc: 'Find a tutor, pick a time, and confirm.' },
  { icon: Shield,      color: 'bg-green-100 text-green-600',    title: 'How Escrow Protects You',    desc: 'Your money is safe until the session is done.' },
  { icon: CreditCard,  color: 'bg-blue-100 text-blue-600',      title: 'Payments & Refunds',         desc: 'Everything about how payments work.' },
  { icon: Users,       color: 'bg-yellow-100 text-yellow-600',  title: 'Becoming a Tutor',           desc: 'How to get verified and start earning.' },
]

export default function HelpSupport() {
  const [query,    setQuery]   = useState('')
  const [openIdx,  setOpenIdx] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const scrollRef = useRef(null)

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(query.toLowerCase()) ||
    f.a.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="pb-28">
      <PageHeader title="Help & Support" />
      <div className="px-5">

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45" />
          <input
            type="text"
            placeholder="How can we help?"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpenIdx(null) }}
            className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40"
          />
        </div>

        {/* Quick Guides carousel */}
        {!query && (
          <>
            <h3 className="font-outfit font-semibold text-base text-secondary mb-3">Quick Guides</h3>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-2 mb-6 no-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {GUIDES.map((g, i) => {
                const Icon = g.icon
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 w-44 bg-white/80 border border-white/45 rounded-2xl p-4 shadow-sm"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${g.color}`}>
                      <Icon size={18} />
                    </div>
                    <p className="font-outfit font-semibold text-sm text-secondary mb-1 leading-tight">{g.title}</p>
                    <p className="font-inter text-xs text-secondary/50 leading-relaxed">{g.desc}</p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* FAQ Accordion */}
        <h3 className="font-outfit font-semibold text-base text-secondary mb-3">
          {query ? `Results for "${query}"` : 'Frequently Asked Questions'}
        </h3>
        <div className="flex flex-col gap-2 mb-8">
          {filtered.length === 0 && (
            <p className="font-inter text-sm text-secondary/50 text-center py-6">No results found. Try different keywords.</p>
          )}
          {filtered.map((faq, i) => (
            <GlassCard
              key={i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="p-4 cursor-pointer"
              hover={false}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-outfit font-semibold text-sm text-secondary">{faq.q}</p>
                <span className="flex-shrink-0">
                  {openIdx === i
                    ? <Minus size={16} className="text-primary" />
                    : <Plus  size={16} className="text-secondary/40" />
                  }
                </span>
              </div>
              {openIdx === i && (
                <p className="font-inter text-sm text-secondary/65 leading-relaxed mt-3 animate-slide-up">
                  {faq.a}
                </p>
              )}
            </GlassCard>
          ))}
        </div>

        {/* Support card */}
        <GlassCard className="p-5 flex items-center gap-4" hover={false}>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
            <MessageSquareMore size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-outfit font-semibold text-sm text-secondary">Live Support</p>
            <p className="font-inter text-xs text-secondary/50">Chat with our team · avg 5 min reply</p>
          </div>
          <button
            onClick={() => setChatOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-semibold font-outfit hover:opacity-90 transition-opacity"
          >
            Chat
          </button>
        </GlassCard>
      </div>

      {/* Sticky Live Chat FAB */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary shadow-glow flex items-center justify-center z-40 hover:scale-105 transition-transform active:scale-95"
      >
        <MessageSquareMore size={22} className="text-white" />
      </button>

      {/* Chat sheet (placeholder) */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-outfit font-bold text-base text-secondary">Live Support</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
              >
                <Minus size={15} className="text-secondary/60" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-center">
              <div className="text-3xl mb-2">👋</div>
              <p className="font-outfit font-semibold text-sm text-secondary">Hi there!</p>
              <p className="font-inter text-xs text-secondary/55 mt-1">Our team typically replies in under 5 minutes. How can we help?</p>
            </div>
            <div className="flex gap-3">
              <input
                className="flex-1 py-3 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white text-secondary outline-none focus:border-primary placeholder:text-secondary/40"
                placeholder="Type your message…"
              />
              <button className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                <MessageSquareMore size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
