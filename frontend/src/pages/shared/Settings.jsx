import React, { useState } from 'react'
import { Moon, Sun, Globe, Bell, Lock, User, Save } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import { usersAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function Settings() {
  const { user, setUser } = useAuthStore()
  const { showToast } = useUIStore()
  const [darkMode,  setDarkMode]  = useState(false)
  const [notif,     setNotif]     = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
  })

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await usersAPI.updateProfile(form)
      setUser(res.data)
      showToast('Settings saved!', 'success')
    } catch {
      showToast('Failed to save changes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-20">
      <PageHeader title="Settings" />
      <div className="px-5 flex flex-col gap-5">

        {/* Personal info */}
        <Section title="Personal Information" icon={User}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.first_name} onChange={set('first_name')} />
              <Input label="Last Name"  value={form.last_name}  onChange={set('last_name')} />
            </div>
            <Input label="Phone" value={form.phone} onChange={set('phone')} />
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon={Globe}>
          <div className="flex flex-col gap-3">
            <Toggle
              icon={darkMode ? Moon : Sun}
              label="Dark Mode"
              sub="Switch to dark theme"
              checked={darkMode}
              onChange={() => setDarkMode(v => !v)}
            />
            <Toggle
              icon={Bell}
              label="Push Notifications"
              sub="Get session & payment alerts"
              checked={notif}
              onChange={() => setNotif(v => !v)}
            />
          </div>
        </Section>

        <Button size="full" onClick={save} loading={saving}>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h3 className="font-outfit font-semibold text-sm text-secondary mb-3 flex items-center gap-2">
        <Icon size={14} className="text-primary" /> {title}
      </h3>
      {children}
    </div>
  )
}

function Toggle({ icon: Icon, label, sub, checked, onChange }) {
  return (
    <GlassCard className="p-4 flex items-center gap-4" hover={false}>
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-inter text-sm text-secondary font-medium">{label}</p>
        <p className="font-inter text-xs text-secondary/50">{sub}</p>
      </div>
      <div
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-secondary/15'}`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </div>
    </GlassCard>
  )
}
