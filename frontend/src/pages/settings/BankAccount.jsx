import React, { useState } from 'react'
import { Building2, CreditCard, User, Save, ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { usersAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

const NIGERIAN_BANKS = [
  'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank',
  'Fidelity Bank', 'FCMB', 'Union Bank', 'Sterling Bank', 'Stanbic IBTC',
  'Polaris Bank', 'Wema Bank', 'Ecobank', 'Heritage Bank', 'Keystone Bank',
  'OPay', 'Kuda Bank', 'PalmPay', 'Moniepoint',
]

export default function BankAccount() {
  const { showToast } = useUIStore()
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_name: '' })
  const [saving, setSaving]   = useState(false)
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [errors, setErrors]   = useState({})

  const set = (f) => (e) => {
    const val = f === 'account_number' ? e.target.value.replace(/\D/g,'').slice(0,10) : e.target.value
    setForm(s => ({ ...s, [f]: val }))
    if (f === 'account_number') setVerified(false)
  }

  // Simulate account name lookup (replace with real Paystack resolve endpoint)
  const verifyAccount = () => {
    if (form.account_number.length !== 10) {
      showToast('Enter a valid 10-digit account number.', 'error'); return
    }
    if (!form.bank_name) {
      showToast('Please select a bank first.', 'error'); return
    }
    setVerifying(true)
    setTimeout(() => {
      setForm(s => ({ ...s, account_name: 'KOLADE OKONKWO' }))
      setVerified(true)
      setVerifying(false)
    }, 1200)
  }

  const save = async () => {
    const e = {}
    if (!form.bank_name)        e.bank_name       = 'Select a bank'
    if (form.account_number.length !== 10) e.account_number = '10-digit account number required'
    if (!form.account_name)     e.account_name    = 'Verify account name first'
    if (Object.keys(e).length)  { setErrors(e); return }
    setErrors({})
    setSaving(true)
    try {
      await usersAPI.saveBankAccount(form)
      showToast('Bank account saved successfully!', 'success')
    } catch {
      showToast('Failed to save bank account.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader title="Bank Account" subtitle="Where your earnings will be paid" />
      <div className="px-5 flex flex-col gap-5">

        {/* Payout info */}
        <GlassCard className="p-4 flex items-start gap-3" hover={false}>
          <ShieldCheck size={18} className="text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">Weekly Payouts</p>
            <p className="font-inter text-xs text-secondary/55 mt-0.5 leading-relaxed">
              Earnings are paid every Friday at 10 AM for all confirmed sessions from the previous week.
            </p>
          </div>
        </GlassCard>

        {/* Bank form */}
        <div className="flex flex-col gap-4">
          {/* Bank selector */}
          <div>
            <label className="block font-inter text-xs text-secondary/60 mb-1.5">Bank Name</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/35" />
              <select
                value={form.bank_name}
                onChange={set('bank_name')}
                className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white text-secondary outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="">Select your bank</option>
                {NIGERIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            {errors.bank_name && <p className="text-xs text-red-500 mt-1">{errors.bank_name}</p>}
          </div>

          {/* Account number + verify */}
          <div>
            <label className="block font-inter text-xs text-secondary/60 mb-1.5">Account Number</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/35" />
                <input
                  type="tel"
                  placeholder="10-digit NUBAN"
                  value={form.account_number}
                  onChange={set('account_number')}
                  maxLength={10}
                  className="w-full py-3.5 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white text-secondary outline-none focus:border-primary placeholder:text-secondary/35"
                />
              </div>
              <Button size="sm" variant={verified ? 'ghost' : 'primary'} onClick={verifyAccount} loading={verifying}>
                {verified ? '✓ Verified' : 'Verify'}
              </Button>
            </div>
            {errors.account_number && <p className="text-xs text-red-500 mt-1">{errors.account_number}</p>}
          </div>

          {/* Account name (auto-filled) */}
          <div>
            <Input
              label="Account Name"
              icon={User}
              value={form.account_name}
              disabled
              placeholder="Auto-filled after verification"
            />
            {verified && (
              <p className="text-xs font-inter text-success mt-1 flex items-center gap-1">
                <ShieldCheck size={11} /> Account verified
              </p>
            )}
            {errors.account_name && <p className="text-xs text-red-500 mt-1">{errors.account_name}</p>}
          </div>
        </div>

        <Button size="full" onClick={save} loading={saving} disabled={!verified}>
          <Save size={16} /> Save Bank Account
        </Button>
      </div>
    </div>
  )
}
