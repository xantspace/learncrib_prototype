import React, { useState } from 'react'
import { Search, Plus, Minus, MessageSquareMore } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'

const FAQS = [
  { q: 'How does the escrow payment system work?',        a: 'When you pay for a session, funds are held securely. They\'re released to your tutor 48 hours after session completion — unless you raise a dispute.' },
  { q: 'What happens if my tutor doesn\'t show up?',      a: 'You\'ll receive a full refund within 24 hours. The tutor will also face a penalty and potential suspension.' },
  { q: 'Can I cancel a booking?',                         a: 'Yes. Cancellations more than 24 hours in advance get a full refund. Late cancellations (<24hrs) receive a 50% refund.' },
  { q: 'How do I become a verified tutor?',               a: 'Complete your profile and our team will manually verify your credentials within 2–3 business days.' },
  { q: 'When do tutors receive payment?',                 a: 'Tutors are paid weekly every Friday at 10 AM, for all sessions completed and confirmed that week.' },
  { q: 'How do I dispute a session?',                     a: 'After a session, you have 48 hours to tap "Report an Issue" from your sessions page. Our team reviews all disputes manually.' },
]

export default function HelpSupport() {
  const [query,  setQuery]  = useState('')
  const [openIdx, setOpenIdx] = useState(null)

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(query.toLowerCase()) ||
    f.a.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="pb-20">
      <PageHeader title="Help & Support" />
      <div className="px-5">
        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45" />
          <input
            type="text"
            placeholder="How can we help?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40"
          />
        </div>

        {/* FAQ */}
        <h3 className="font-outfit font-semibold text-base text-secondary mb-3">Frequently Asked Questions</h3>
        <div className="flex flex-col gap-2 mb-8">
          {filtered.map((faq, i) => (
            <GlassCard
              key={i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="p-4"
              hover={false}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-outfit font-semibold text-sm text-secondary">{faq.q}</p>
                {openIdx === i ? <Minus size={16} className="text-primary flex-shrink-0" /> : <Plus size={16} className="text-secondary/40 flex-shrink-0" />}
              </div>
              {openIdx === i && (
                <p className="font-inter text-sm text-secondary/65 leading-relaxed mt-3 animate-slide-up">
                  {faq.a}
                </p>
              )}
            </GlassCard>
          ))}
        </div>

        {/* Live chat CTA */}
        <GlassCard className="p-5 flex items-center gap-4" hover={false}>
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <MessageSquareMore size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-outfit font-semibold text-sm text-secondary">Live Support</p>
            <p className="font-inter text-xs text-secondary/50">Chat with our team — avg response 5 min</p>
          </div>
          <button className="bg-primary text-white px-3 py-1.5 rounded-xl text-xs font-semibold font-outfit">Chat</button>
        </GlassCard>
      </div>
    </div>
  )
}
