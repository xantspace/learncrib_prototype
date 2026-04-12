import React, { useState } from 'react'
import { CreditCard, Plus, Trash2, CheckCircle, ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useUIStore } from '@/store/uiStore'

// Saved cards stored locally until backend is wired
const CARD_BRANDS = {
  '4': { name: 'Visa',       color: 'from-blue-600 to-blue-800' },
  '5': { name: 'Mastercard', color: 'from-red-500 to-orange-500' },
  '3': { name: 'Amex',       color: 'from-green-600 to-teal-700' },
}

function getCardBrand(num) {
  return CARD_BRANDS[num?.[0]] || { name: 'Card', color: 'from-gray-600 to-gray-800' }
}

function maskNumber(num) {
  const clean = num.replace(/\s/g, '')
  return `•••• •••• •••• ${clean.slice(-4)}`
}

export default function PaymentMethods() {
  const { showToast } = useUIStore()

  const [cards, setCards]     = useState([
    { id: '1', number: '4111111111114242', name: 'TEMI ADEYEMI', expiry: '12/27', default: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form, setForm] = useState({ number: '', name: '', expiry: '', cvv: '' })

  const set = (f) => (e) => {
    let val = e.target.value
    if (f === 'number') val = val.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim()
    if (f === 'expiry') val = val.replace(/\D/g,'').slice(0,4).replace(/(.{2})/, '$1/')
    if (f === 'cvv')    val = val.replace(/\D/g,'').slice(0,4)
    setForm(s => ({ ...s, [f]: val }))
  }

  const addCard = () => {
    if (!form.number || !form.name || !form.expiry || !form.cvv) {
      showToast('Please fill in all card details.', 'error'); return
    }
    setSaving(true)
    setTimeout(() => {
      setCards(c => [...c, { id: Date.now().toString(), ...form, default: false }])
      setForm({ number: '', name: '', expiry: '', cvv: '' })
      setShowForm(false)
      setSaving(false)
      showToast('Card added successfully!', 'success')
    }, 800)
  }

  const removeCard = (id) => {
    setCards(c => c.filter(card => card.id !== id))
    showToast('Card removed.', 'info')
  }

  const setDefault = (id) => {
    setCards(c => c.map(card => ({ ...card, default: card.id === id })))
    showToast('Default card updated.', 'success')
  }

  return (
    <div className="pb-10">
      <PageHeader title="Payment Methods" subtitle="Manage your saved cards" />
      <div className="px-5 flex flex-col gap-4">

        {/* Escrow note */}
        <GlassCard className="p-4 flex items-center gap-3" hover={false}>
          <ShieldCheck size={18} className="text-success flex-shrink-0" />
          <p className="font-inter text-xs text-secondary/65 leading-relaxed">
            All payments are held in escrow and only released after your session is confirmed.
          </p>
        </GlassCard>

        {/* Saved cards */}
        {cards.map(card => {
          const brand = getCardBrand(card.number)
          return (
            <div key={card.id} className={`bg-gradient-to-br ${brand.color} rounded-3xl p-5 relative overflow-hidden`}>
              {/* Card shine effect */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 translate-y-8 -translate-x-8" />

              <div className="flex items-start justify-between mb-6 relative">
                <div>
                  <p className="font-outfit font-bold text-white text-lg tracking-widest">
                    {brand.name}
                  </p>
                  {card.default && (
                    <span className="inline-flex items-center gap-1 text-xs text-white/70 font-inter mt-0.5">
                      <CheckCircle size={10} /> Default
                    </span>
                  )}
                </div>
                <CreditCard size={22} className="text-white/70" />
              </div>

              <p className="font-outfit font-semibold text-white text-base tracking-widest relative">
                {maskNumber(card.number)}
              </p>
              <div className="flex items-center justify-between mt-3 relative">
                <div>
                  <p className="text-white/50 text-[10px] font-inter uppercase tracking-wider">Card Holder</p>
                  <p className="font-outfit font-semibold text-white text-sm">{card.name}</p>
                </div>
                <div>
                  <p className="text-white/50 text-[10px] font-inter uppercase tracking-wider">Expires</p>
                  <p className="font-outfit font-semibold text-white text-sm">{card.expiry}</p>
                </div>
                <div className="flex gap-2">
                  {!card.default && (
                    <button onClick={() => setDefault(card.id)}
                      className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                      <CheckCircle size={14} className="text-white" />
                    </button>
                  )}
                  <button onClick={() => removeCard(card.id)}
                    className="w-8 h-8 rounded-xl bg-white/20 hover:bg-red-400/40 flex items-center justify-center transition-all">
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add card */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary/25 rounded-3xl text-primary font-outfit font-semibold text-sm hover:border-primary/50 hover:bg-primary-light transition-all"
          >
            <Plus size={18} /> Add New Card
          </button>
        ) : (
          <GlassCard className="p-5" hover={false}>
            <p className="font-outfit font-semibold text-sm text-secondary mb-4">Add Card Details</p>
            <div className="flex flex-col gap-3">
              <Input
                label="Card Number"
                icon={CreditCard}
                placeholder="1234 5678 9012 3456"
                value={form.number}
                onChange={set('number')}
                maxLength={19}
              />
              <Input
                label="Cardholder Name"
                placeholder="Name as on card"
                value={form.name}
                onChange={set('name')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={set('expiry')}
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  placeholder="•••"
                  type="password"
                  value={form.cvv}
                  onChange={set('cvv')}
                  maxLength={4}
                />
              </div>
              <div className="flex gap-2 mt-1">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" className="flex-1" onClick={addCard} loading={saving}>
                  Save Card
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

      </div>
    </div>
  )
}
