import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Clock, Timer, Globe, Home, BookOpen, FileText, CreditCard, Star } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import { usersAPI, sessionsAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const DURATIONS = [
  { label: '30 min', minutes: 30, multiplier: 0.5 },
  { label: '1 hour', minutes: 60, multiplier: 1 },
  { label: '2 hours', minutes: 120, multiplier: 2 },
]

const PLATFORM_FEE_RATE = 0.10 // 10% shown to student (15% total taken from tutor payout)

function getNextDays(n = 7) {
  const days = []
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      label: dayNames[d.getDay()],
      num:   d.getDate(),
      date:  d.toISOString().split('T')[0],
      past:  false,
    })
  }
  return days
}

const TIME_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']

export default function BookSession() {
  const { tutorId } = useParams()
  const navigate    = useNavigate()
  const { showToast } = useUIStore()

  const [tutor, setTutor]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const days = getNextDays(7)
  const [selectedDate, setSelectedDate] = useState(days[0].date)
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1])
  const [selectedDur,  setSelectedDur]  = useState(DURATIONS[1])
  const [sessionType,  setSessionType]  = useState('online')
  const [subject,      setSubject]      = useState('')
  const [notes,        setNotes]        = useState('')

  useEffect(() => {
    setLoading(true)
    usersAPI.getTutorById(tutorId)
      .then(r => setTutor(r.data))
      .catch(() => showToast('Failed to load tutor details', 'error'))
      .finally(() => setLoading(false))
  }, [tutorId])

  const rate       = Number(tutor?.hourly_rate || 0)
  const sessionCost = rate * selectedDur.multiplier
  const platformFee = Math.round(sessionCost * PLATFORM_FEE_RATE)
  const total       = sessionCost + platformFee

  const handleBook = async () => {
    if (!subject.trim()) { showToast('Please enter a subject/topic', 'error'); return }
    setSubmitting(true)

    // Build ISO datetime from date + time
    const [timePart, period] = selectedTime.split(' ')
    let [h, m] = timePart.split(':').map(Number)
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    const scheduledAt = new Date(`${selectedDate}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)

    try {
      const res = await sessionsAPI.create({
        tutor_id:     tutorId,
        subject,
        notes,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: selectedDur.minutes,
        session_type: sessionType,
      })
      navigate(`/student/payment/${res.data.id}`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create session. Please try again.'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-svh">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const tutorName = tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Tutor'
  const tutorInitials = tutor ? `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase() : '??'

  return (
    <div className="pb-48">
      <PageHeader title="Book a Session" subtitle="Choose your details and confirm" />

      <div className="px-5">
        {/* Tutor summary */}
        {tutor && (
          <GlassCard className="p-4 flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
              {tutorInitials}
            </div>
            <div className="flex-1">
              <h3 className="font-outfit font-semibold text-base text-secondary">{tutorName}</h3>
              <p className="font-inter text-xs text-secondary/50">{(tutor.subjects || []).join(' · ')}</p>
              {tutor.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star size={12} className="text-accent fill-current" />
                  <span className="text-xs font-semibold">{tutor.rating}</span>
                </div>
              )}
            </div>
            <span className="font-outfit font-bold text-lg text-primary">
              ₦{Number(tutor.hourly_rate).toLocaleString()}
              <span className="font-inter font-normal text-xs text-secondary/40">/hr</span>
            </span>
          </GlassCard>
        )}

        {/* Date picker */}
        <Section icon={CalendarDays} title="Select Date">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {days.map(({ label, num, date }) => (
              <div
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-1 flex-shrink-0 px-3.5 py-2.5 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${
                  selectedDate === date
                    ? 'border-primary bg-primary-light'
                    : 'border-transparent bg-gray-50 hover:border-primary/30'
                }`}
              >
                <span className={`font-inter text-xs ${selectedDate === date ? 'text-primary' : 'text-secondary/50'}`}>{label}</span>
                <span className={`font-outfit font-bold text-base ${selectedDate === date ? 'text-primary' : 'text-secondary'}`}>{num}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Time slots */}
        <Section icon={Clock} title="Select Time">
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map(slot => (
              <div
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`text-center py-2.5 rounded-2xl text-xs font-inter font-medium cursor-pointer border-2 transition-all ${
                  selectedTime === slot
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-transparent bg-gray-50 text-secondary hover:border-primary/30'
                }`}
              >
                {slot}
              </div>
            ))}
          </div>
        </Section>

        {/* Duration */}
        <Section icon={Timer} title="Duration">
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map(dur => (
              <div
                key={dur.label}
                onClick={() => setSelectedDur(dur)}
                className={`text-center py-2.5 rounded-2xl text-xs font-inter font-medium cursor-pointer border-2 transition-all ${
                  selectedDur.label === dur.label
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-transparent bg-gray-50 text-secondary hover:border-primary/30'
                }`}
              >
                {dur.label}
              </div>
            ))}
          </div>
        </Section>

        {/* Session type */}
        <Section icon={Globe} title="Session Type">
          <div className="grid grid-cols-2 gap-3">
            {[
              { val: 'online',     icon: Globe, label: 'Online',     sub: 'Video call' },
              { val: 'in-person',  icon: Home,  label: 'In-Person',  sub: "Tutor's location" },
            ].map(({ val, icon: Icon, label, sub }) => (
              <GlassCard
                key={val}
                onClick={() => setSessionType(val)}
                className={`p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                  sessionType === val ? 'border-primary' : 'border-transparent'
                }`}
              >
                <Icon size={22} className={sessionType === val ? 'text-primary' : 'text-secondary/40'} />
                <span className="font-outfit font-semibold text-sm text-secondary">{label}</span>
                <span className="text-xs font-inter text-secondary/50">{sub}</span>
              </GlassCard>
            ))}
          </div>
        </Section>

        {/* Subject */}
        <Section icon={BookOpen} title="Subject / Topic">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Differentiation & Integration"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none transition-all focus:border-primary focus:shadow-[0_0_0_4px_#EEF2FF] placeholder:text-secondary/40"
            />
          </div>
        </Section>

        {/* Notes */}
        <Section icon={FileText} title={<>Special Notes <span className="font-inter font-normal text-xs text-secondary/40">(optional)</span></>}>
          <textarea
            placeholder="Anything the tutor should know…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none resize-none h-20 transition-all focus:border-primary focus:shadow-[0_0_0_4px_#EEF2FF] placeholder:text-secondary/40"
          />
        </Section>
      </div>

      {/* Sticky price + CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 z-50"
        style={{ background: 'linear-gradient(to top, white 75%, transparent)' }}>
        <GlassCard className="p-4 mb-3" hover={false}>
          <div className="flex justify-between text-sm font-inter mb-1">
            <span className="text-secondary/60">₦{rate.toLocaleString()} × {selectedDur.label}</span>
            <span className="text-secondary">₦{sessionCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-inter mb-2">
            <span className="text-secondary/60">Platform fee</span>
            <span className="text-secondary">₦{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-outfit font-bold border-t pt-2" style={{ borderColor: 'rgba(26,43,68,.1)' }}>
            <span className="text-secondary">Total</span>
            <span className="text-primary">₦{total.toLocaleString()}</span>
          </div>
        </GlassCard>
        <Button size="full" onClick={handleBook} loading={submitting}>
          <CreditCard size={16} /> Proceed to Payment
        </Button>
      </div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-5">
      <h3 className="font-outfit font-semibold text-sm text-secondary mb-3 flex items-center gap-2">
        <Icon size={15} className="text-primary" />{title}
      </h3>
      {children}
    </div>
  )
}
