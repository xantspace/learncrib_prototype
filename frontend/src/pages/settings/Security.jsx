import React, { useState } from 'react'
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { authAPI } from '@/services/api'
import { useUIStore } from '@/store/uiStore'

export default function Security() {
  const { showToast } = useUIStore()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }))
  const toggleShow = (f) => setShow(s => ({ ...s, [f]: !s[f] }))

  const validate = () => {
    const e = {}
    if (!form.current_password)        e.current_password = 'Current password is required'
    if (form.new_password.length < 8)  e.new_password     = 'Minimum 8 characters'
    if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  const save = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await authAPI.changePassword({
        old_password:  form.current_password,
        new_password:  form.new_password,
      })
      showToast('Password changed successfully!', 'success')
      setForm({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.old_password?.[0] || 'Failed to change password.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-10">
      <PageHeader title="Security" subtitle="Manage your password and account security" />
      <div className="px-5 flex flex-col gap-5">

        {/* Security status */}
        <GlassCard className="p-4 flex items-center gap-4" hover={false}>
          <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
            <ShieldCheck size={18} className="text-green-600" />
          </div>
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">Account Protected</p>
            <p className="font-inter text-xs text-secondary/50">Your account is secured with a password</p>
          </div>
        </GlassCard>

        {/* Change password */}
        <div>
          <h3 className="font-outfit font-semibold text-sm text-secondary mb-3 flex items-center gap-2">
            <Lock size={14} className="text-primary" /> Change Password
          </h3>
          <div className="flex flex-col gap-3">
            <PasswordField
              label="Current Password"
              value={form.current_password}
              onChange={set('current_password')}
              show={show.current}
              onToggle={() => toggleShow('current')}
              error={errors.current_password}
            />
            <PasswordField
              label="New Password"
              value={form.new_password}
              onChange={set('new_password')}
              show={show.new}
              onToggle={() => toggleShow('new')}
              error={errors.new_password}
            />
            <PasswordField
              label="Confirm New Password"
              value={form.confirm_password}
              onChange={set('confirm_password')}
              show={show.confirm}
              onToggle={() => toggleShow('confirm')}
              error={errors.confirm_password}
            />
          </div>
        </div>

        {/* Password strength hint */}
        {form.new_password.length > 0 && (
          <StrengthBar password={form.new_password} />
        )}

        <Button size="full" onClick={save} loading={saving}>
          Update Password
        </Button>
      </div>
    </div>
  )
}

function PasswordField({ label, value, onChange, show, onToggle, error }) {
  return (
    <div>
      {label && <label className="block font-inter text-xs text-secondary/60 mb-1.5">{label}</label>}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
          <Lock size={15} className="text-secondary/35" />
        </div>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full py-3.5 pl-10 pr-10 border border-secondary/15 rounded-2xl font-inter text-sm bg-white text-secondary outline-none focus:border-primary placeholder:text-secondary/35 transition-colors"
          placeholder="••••••••"
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/35 hover:text-secondary/60">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400']

  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : 'bg-secondary/10'}`} />
        ))}
      </div>
      <p className="text-xs font-inter text-secondary/50">
        Strength: <span className="font-semibold">{labels[strength] || 'Very Weak'}</span>
      </p>
    </div>
  )
}
