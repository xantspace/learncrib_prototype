import React, { useState } from 'react'
import { Calendar, Save } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/shared/PageHeader'
import { useUIStore } from '@/store/uiStore'
import api from '@/services/api'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const SLOTS = ['7:00 AM','8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']

export default function TutorAvailability() {
  const { showToast } = useUIStore()
  const [schedule, setSchedule] = useState(
    Object.fromEntries(DAYS.map(d => [d, []]))
  )
  const [saving, setSaving] = useState(false)

  const toggle = (day, slot) => {
    setSchedule(s => ({
      ...s,
      [day]: s[day].includes(slot) ? s[day].filter(x => x !== slot) : [...s[day], slot]
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.post('/api/users/availability/', { schedule })
      showToast('Availability saved!', 'success')
    } catch {
      showToast('Failed to save. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pb-28">
      <PageHeader title="Availability" subtitle="Set your weekly schedule" back={false} />
      <div className="px-5">
        {DAYS.map(day => (
          <div key={day} className="mb-5">
            <p className="font-outfit font-semibold text-sm text-secondary mb-2 flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> {day}
            </p>
            <div className="flex flex-wrap gap-2">
              {SLOTS.map(slot => (
                <button
                  key={slot}
                  onClick={() => toggle(day, slot)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-inter font-medium border-2 transition-all ${
                    schedule[day].includes(slot)
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-transparent bg-gray-100 text-secondary/60 hover:border-primary/30'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Button size="full" onClick={save} loading={saving}>
          <Save size={16} /> Save Schedule
        </Button>
      </div>
    </div>
  )
}
