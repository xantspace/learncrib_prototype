import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Book, DollarSign, Bell, Camera } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { usersAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const SUBJECTS = [
  { label: 'Mathematics', emoji: '📐' },
  { label: 'Physics',     emoji: '🛰️' },
  { label: 'Chemistry',   emoji: '🧪' },
  { label: 'English',     emoji: '📖' },
  { label: 'Coding',      emoji: '💻' },
  { label: 'Biology',     emoji: '🔬' },
  { label: 'Economics',   emoji: '📊' },
  { label: 'Design',      emoji: '🎨' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const { showToast } = useUIStore()
  const isTutor = user?.role === 'TUTOR'

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [location, setLocation] = useState('Lagos, Nigeria')
  const [education, setEducation] = useState('')
  const [rate, setRate] = useState('')

  const toggleSubject = (label) => {
    setSelectedSubjects(s =>
      s.includes(label) ? s.filter(x => x !== label) : [...s, label]
    )
  }

  const finish = async () => {
    setLoading(true)
    try {
      const payload = { subjects: selectedSubjects, location }
      if (isTutor) { payload.education = education; payload.hourly_rate = Number(rate) }
      const res = await usersAPI.updateProfile(payload)
      setUser(res.data)
      navigate(isTutor ? '/tutor/dashboard' : '/student/dashboard', { replace: true })
    } catch {
      showToast('Failed to save profile. You can update it later in Settings.', 'error')
      navigate(isTutor ? '/tutor/dashboard' : '/student/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const indicators = [1, 2, 3]

  return (
    <div className="min-h-svh flex flex-col px-6 pt-14 pb-10 bg-surface">
      {/* Progress bar */}
      <div className="flex gap-2 mb-10">
        {indicators.map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < step ? 'bg-success' : i === step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Subjects */}
      {step === 1 && (
        <div className="flex flex-col flex-1">
          <h1 className="font-outfit font-bold text-3xl text-secondary mb-1">
            {isTutor ? 'What do you teach?' : 'What do you want to learn?'}
          </h1>
          <p className="font-inter text-sm text-secondary/50 mb-8">Select the subjects you're interested in.</p>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 no-scrollbar">
            {SUBJECTS.map(({ label, emoji }) => (
              <GlassCard
                key={label}
                onClick={() => toggleSubject(label)}
                className={`p-4 flex flex-col items-center gap-2 border-2 transition-all active:scale-95 ${
                  selectedSubjects.includes(label) ? 'border-primary bg-primary-light' : 'border-transparent'
                }`}
              >
                <div className="text-2xl">{emoji}</div>
                <p className="font-outfit font-bold text-sm text-secondary">{label}</p>
              </GlassCard>
            ))}
          </div>
          <Button size="full" onClick={() => setStep(2)} className="mt-6">Continue</Button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="flex flex-col flex-1">
          <h1 className="font-outfit font-bold text-3xl text-secondary mb-1">
            {isTutor ? 'Tutor Credentials' : 'Tell us more'}
          </h1>
          <p className="font-inter text-sm text-secondary/50 mb-8">Help us personalize your crib experience.</p>
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <p className="text-xs font-inter font-bold uppercase tracking-widest mb-2 opacity-40">Your Location</p>
              <Input icon={MapPin} placeholder="City, State" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            {isTutor && (
              <>
                <div>
                  <p className="text-xs font-inter font-bold uppercase tracking-widest mb-2 opacity-40">Education / Certifications</p>
                  <Input icon={Book} placeholder="B.Sc, PhD, etc." value={education} onChange={e => setEducation(e.target.value)} />
                </div>
                <div>
                  <p className="text-xs font-inter font-bold uppercase tracking-widest mb-2 opacity-40">Hourly Rate (₦)</p>
                  <Input icon={DollarSign} type="number" placeholder="2500" value={rate} onChange={e => setRate(e.target.value)} />
                </div>
              </>
            )}
          </div>
          <Button size="full" onClick={() => setStep(3)} className="mt-6">Continue</Button>
        </div>
      )}

      {/* Step 3: Profile photo + notifications */}
      {step === 3 && (
        <div className="flex flex-col flex-1">
          <h1 className="font-outfit font-bold text-3xl text-secondary mb-1">Final Touch</h1>
          <p className="font-inter text-sm text-secondary/50 mb-12">Let's set up your identity and alerts.</p>
          <div className="flex flex-col items-center gap-8 flex-1">
            {/* Avatar placeholder */}
            <div className="relative">
              <div className="w-32 h-32 rounded-[40px] bg-gray-100 flex items-center justify-center border-4 border-white shadow-xl">
                <Camera size={36} className="text-gray-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-lg font-bold">+</span>
              </div>
            </div>
            {/* Notifications */}
            <GlassCard className="p-5 w-full flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell size={18} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-outfit font-bold text-sm text-secondary">Enable Notifications</p>
                <p className="font-inter text-xs text-secondary/50">Never miss a session or message.</p>
              </div>
              <div className="w-10 h-5 rounded-full bg-primary relative">
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
              </div>
            </GlassCard>
          </div>
          <Button size="full" onClick={finish} loading={loading} className="mt-6">Finish Setup</Button>
        </div>
      )}
    </div>
  )
}
