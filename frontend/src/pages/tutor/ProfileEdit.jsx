import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, DollarSign, Book, Save } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'
import { usersAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Coding','Biology','Economics','Design']

export default function TutorProfileEdit() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { showToast } = useUIStore()

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    bio:        user?.bio        || '',
    hourly_rate: user?.hourly_rate || '',
    education:  user?.education  || '',
  })
  const [subjects, setSubjects] = useState(user?.subjects || [])
  const [saving, setSaving] = useState(false)

  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }))
  const toggle = (s) => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const save = async () => {
    setSaving(true)
    try {
      const res = await usersAPI.updateProfile({ ...form, subjects, hourly_rate: Number(form.hourly_rate) })
      setUser(res.data)
      showToast('Profile updated!', 'success')
      navigate('/tutor/profile')
    } catch {
      showToast('Failed to update profile.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-28">
      <PageHeader title="Edit Profile" />
      <div className="px-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input icon={User} label="First Name" value={form.first_name} onChange={set('first_name')} />
          <Input label="Last Name" value={form.last_name} onChange={set('last_name')} />
        </div>
        <div>
          <p className="text-xs font-inter font-semibold uppercase tracking-widest text-secondary/45 mb-2">Bio</p>
          <textarea value={form.bio} onChange={e => setForm(s => ({ ...s, bio: e.target.value }))}
            placeholder="Tell students about yourself…"
            className="w-full py-3.5 px-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none resize-none h-24 focus:border-primary placeholder:text-secondary/40" />
        </div>
        <Input icon={DollarSign} label="Hourly Rate (₦)" type="number" value={form.hourly_rate} onChange={set('hourly_rate')} />
        <Input icon={Book}       label="Education"       value={form.education} onChange={set('education')} />

        <div>
          <p className="text-xs font-inter font-semibold uppercase tracking-widest text-secondary/45 mb-2">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => toggle(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-inter font-medium border-2 transition-all ${
                  subjects.includes(s) ? 'border-primary bg-primary-light text-primary' : 'border-transparent bg-gray-100 text-secondary/60'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <Button size="full" onClick={save} loading={saving}>
          <Save size={16} /> Save Changes
        </Button>
      </div>
    </div>
  )
}
