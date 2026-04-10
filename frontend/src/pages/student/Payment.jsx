import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CreditCard, Landmark, Wallet, Lock, ShieldCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import { sessionsAPI, paymentsAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const PLATFORM_FEE_RATE = 0.10

export default function Payment() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useUIStore()

  const [session, setSession]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [method, setMethod]     = useState('card')
  const [paying, setPaying]     = useState(false)
  const [saveCard, setSaveCard] = useState(false)

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })

  useEffect(() => {
    sessionsAPI.getById(sessionId)
      .then(r => setSession(r.data))
      .catch(() => showToast('Session not found', 'error'))
      .finally(() => setLoading(false))
  }, [sessionId])

  const rate = Number(session?.tutor_hourly_rate || 0)
  const sessionCost = rate
  const platformFee = Math.round(sessionCost * PLATFORM_FEE_RATE)
  const total = sessionCost + platformFee

  const handlePay = async () => {
    if (method === 'card') {
      if (!card.number || !card.expiry || !card.cvv || !card.name) {
        showToast('Please fill in all card details', 'error')
        return
      }
    }
    setPaying(true)
    try {
      const res = await paymentsAPI.initiate({
        session_id: sessionId,
        amount:     total,
        method,
      })
      // If Paystack inline, open popup; otherwise redirect to verify
      if (res.data.authorization_url) {
        window.location.href = res.data.authorization_url
      } else {
        navigate(`/student/booking-confirmation/${sessionId}`)
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Payment failed. Please try again.'
      showToast(msg, 'error')
    } finally {
      setPaying(false)
    }
  }

  const formatCardNumber = (val) => {
    const v = val.replace(/\D/g, '').substring(0, 16)
    return v.replace(/(.{4})/g, '$1 ').trim()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-svh">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const methods = [
    { id: 'card',   icon: CreditCard, label: 'Debit / Credit Card', sub: 'Visa, Mastercard, Verve' },
    { id: 'bank',   icon: Landmark,   label: 'Bank Transfer',       sub: 'Direct transfer via USSD' },
    { id: 'wallet', icon: Wallet,     label: 'LearnCrib Wallet',    sub: 'Balance: ₦0.00' },
  ]

  return (
    <div className="pb-40">
      <PageHeader title="Payment" subtitle="Secure checkout — your details are encrypted" />

      <div className="px-5">
        {/* Escrow trust indicator */}
        <GlassCard className="p-4 mb-5 flex items-center gap-3 bg-primary-light border-l-4 border-primary" hover={false}>
          <ShieldCheck size={20} className="text-primary flex-shrink-0" />
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">Protected by Escrow</p>
            <p className="font-inter text-xs text-secondary/55">Funds are held securely until your session is completed.</p>
          </div>
        </GlassCard>

        {/* Booking summary */}
        {session && (
          <GlassCard className="p-4 mb-5 border-l-4 border-primary" hover={false}>
            <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-3">Booking Summary</p>
            <div className="flex flex-col gap-2 text-sm font-inter">
              <Row label="Tutor"      value={`${session.tutor_first_name || ''} ${session.tutor_last_name || ''}`} />
              <Row label="Subject"    value={session.subject} />
              <Row label="Date & Time" value={session.scheduled_at ? new Date(session.scheduled_at).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} />
              <Row label="Duration"   value={`${session.duration_minutes || 60} minutes`} />
              <Row label="Type"       value={session.session_type || 'Online'} />
            </div>
          </GlassCard>
        )}

        {/* Total */}
        <div className="text-center mb-7">
          <p className="font-inter text-sm text-secondary/50">Total Amount</p>
          <p className="font-outfit font-bold text-5xl mt-1 text-secondary">₦{total.toLocaleString()}</p>
          <p className="font-inter text-xs mt-1 text-secondary/40">
            ₦{sessionCost.toLocaleString()} session + ₦{platformFee.toLocaleString()} platform fee
          </p>
        </div>

        {/* Payment method */}
        <h3 className="font-outfit font-semibold text-sm text-secondary mb-3 flex items-center gap-2">
          <CreditCard size={14} className="text-primary" /> Payment Method
        </h3>
        <div className="flex flex-col gap-3 mb-5">
          {methods.map(({ id, icon: Icon, label, sub }) => (
            <GlassCard
              key={id}
              onClick={() => setMethod(id)}
              className={`p-4 flex items-center gap-4 border-2 transition-all ${method === id ? 'border-primary' : 'border-transparent'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === id ? 'bg-primary-light' : 'bg-gray-100'}`}>
                <Icon size={18} className={method === id ? 'text-primary' : 'text-secondary/40'} />
              </div>
              <div className="flex-1">
                <p className="font-outfit font-semibold text-sm text-secondary">{label}</p>
                <p className="font-inter text-xs text-secondary/50">{sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === id ? 'border-primary' : 'border-gray-300'}`}>
                {method === id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Card form */}
        {method === 'card' && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div>
              <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/40 mb-2">Card Details</p>
              <div className="relative">
                <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45" />
                <input
                  type="text"
                  placeholder="Card number"
                  maxLength={19}
                  value={card.number}
                  onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                  className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary focus:shadow-[0_0_0_4px_#EEF2FF] placeholder:text-secondary/40"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="MM / YY" maxLength={7}
                value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))}
                className="py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40" />
              <input type="text" placeholder="CVV" maxLength={3}
                value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value }))}
                className="py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40" />
            </div>
            <input type="text" placeholder="Cardholder name"
              value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
              className="py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary placeholder:text-secondary/40" />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setSaveCard(v => !v)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${saveCard ? 'bg-primary border-primary' : 'bg-transparent border-primary'}`}
              >
                {saveCard && <span className="text-white text-xs">✓</span>}
              </div>
              <span className="font-inter text-sm text-secondary/65">Save card for future payments</span>
            </label>
          </div>
        )}
      </div>

      {/* Sticky pay button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5 pb-8 pt-4 z-50"
        style={{ background: 'linear-gradient(to top, white 75%, transparent)' }}>
        <Button size="full" onClick={handlePay} loading={paying}>
          <Lock size={16} /> Pay ₦{total.toLocaleString()} Securely
        </Button>
        <p className="text-center text-xs font-inter mt-2 text-secondary/40 flex items-center justify-center gap-1">
          <ShieldCheck size={12} className="text-primary" />
          256-bit SSL encrypted · Powered by Paystack
        </p>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-secondary/60">{label}</span>
      <span className="font-medium text-secondary">{value || '—'}</span>
    </div>
  )
}
