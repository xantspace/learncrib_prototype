import React, { useState } from 'react'
import { User, Mail, Smartphone, Save } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { usersAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function PersonalInfo() {
  const { user, setUser } = useAuthStore()
  const { showToast }     = useUIStore()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await usersAPI.updateProfile({
        first_name: form.first_name,
        last_name:  form.last_name,
        phone:      form.phone,
      })
      setUser(res.data)
      showToast('Profile updated successfully!', 'success')
    } catch {
      showToast('Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div className="pb-10">
      <PageHeader title="Personal Information" subtitle="Update your name and contact details" />
      <div className="px-5 flex flex-col gap-5">

        {/* Avatar */}
        <GlassCard className="p-5 flex items-center gap-4" hover={false}>
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-outfit font-bold text-white text-xl flex-shrink-0">
            {initials || 'ME'}
          </div>
          <div>
            <p className="font-outfit font-semibold text-sm text-secondary">
              {form.first_name} {form.last_name}
            </p>
            <p className="font-inter text-xs text-secondary/50 mt-0.5">{user?.email}</p>
            <p className="font-inter text-xs text-secondary/40 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </GlassCard>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              icon={User}
              value={form.first_name}
              onChange={set('first_name')}
              placeholder="First name"
            />
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={set('last_name')}
              placeholder="Last name"
            />
          </div>

          <Input
            label="Email Address"
            icon={Mail}
            type="email"
            value={form.email}
            disabled
            placeholder="Email address"
          />
          <p className="text-xs font-inter text-secondary/40 -mt-2">
            Email cannot be changed. Contact support if needed.
          </p>

          <Input
            label="Phone Number"
            icon={Smartphone}
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="e.g. 08012345678"
          />
        </div>

        <Button size="full" onClick={save} loading={saving}>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  )
}
