import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { User, Mail, Smartphone, MapPin, ArrowRight, GraduationCap, UserCheck } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import GlassCard from '@/components/ui/GlassCard'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function Signup() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { setAuth } = useAuthStore()
  const { showToast } = useUIStore()

  const [role, setRole] = useState(params.get('role') || 'STUDENT')
  const [loading, setLoading] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', password: '',
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim())  e.last_name  = 'Last name is required'
    if (!form.email.trim())      e.email      = 'Email is required'
    if (form.password.length < 8) e.password  = 'Password must be at least 8 characters'
    if (!termsAgreed)            e.terms      = 'You must agree to the terms'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await authAPI.register({ ...form, role })
      setAuth({ user: res.data.user, access: res.data.access, refresh: res.data.refresh })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail
        || Object.values(err.response?.data || {})[0]?.[0]
        || 'Registration failed. Please try again.'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col px-6 pt-10 pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-secondary/60 mb-6">
        ← Back
      </button>

      <div className="mb-5 animate-slide-up text-center">
        <img src="/assets/img/logo_b.png" alt="LearnCrib" className="h-8 mb-3 object-contain mx-auto logo-adaptive" />
        <h1 className="font-outfit font-bold text-3xl text-secondary">Create account</h1>
        <p className="font-inter text-sm text-secondary/55 mt-1">Join thousands learning in their crib</p>
      </div>

      {/* Role toggle */}
      <div className="mb-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <p className="text-xs font-inter font-semibold uppercase tracking-widest text-secondary/45 mb-2">I am a…</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: 'STUDENT', icon: GraduationCap, label: 'Student', sub: 'Find & book tutors' },
            { val: 'TUTOR',   icon: UserCheck,     label: 'Tutor',   sub: 'Teach & earn' },
          ].map(({ val, icon: Icon, label, sub }) => (
            <GlassCard
              key={val}
              onClick={() => setRole(val)}
              className={`p-4 flex flex-col items-center gap-2 border-2 transition-all duration-300 ${
                role === val ? 'border-primary' : 'border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                role === val ? 'bg-primary-light' : 'bg-secondary/8'
              }`}>
                <Icon size={18} className={role === val ? 'text-primary' : 'text-secondary/50'} />
              </div>
              <span className="font-outfit font-semibold text-sm text-secondary">{label}</span>
              <span className="text-xs font-inter text-center text-secondary/50">{sub}</span>
            </GlassCard>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="grid grid-cols-2 gap-3">
          <Input icon={User} placeholder="First name" value={form.first_name} onChange={set('first_name')} error={errors.first_name} />
          <Input placeholder="Last name" value={form.last_name} onChange={set('last_name')} error={errors.last_name} />
        </div>
        <Input icon={Mail}       type="email" placeholder="Email address"  value={form.email}    onChange={set('email')}    error={errors.email} />
        <Input icon={Smartphone} type="tel"   placeholder="Phone number"   value={form.phone}    onChange={set('phone')} />
        <Input icon={MapPin}     type="password" placeholder="Create password (min 8 chars)" value={form.password} onChange={set('password')} error={errors.password} />

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setTermsAgreed(v => !v)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              termsAgreed ? 'bg-primary border-primary' : 'bg-transparent border-primary'
            }`}
          >
            {termsAgreed && <span className="text-white text-xs">✓</span>}
          </div>
          <span className="text-xs font-inter leading-relaxed text-secondary/60">
            I agree to LearnCrib's{' '}
            <a href="#" className="text-primary font-medium">Terms of Service</a> and{' '}
            <a href="#" className="text-primary font-medium">Privacy Policy</a>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-red-500 -mt-2">{errors.terms}</p>}

        <Button type="submit" size="full" loading={loading} className="mt-2">
          <ArrowRight size={16} /> Create Account
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-inter text-secondary/40">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </form>

      <p className="mt-6 text-center text-sm font-inter text-secondary/55">
        Already have an account?{' '}
        <button onClick={() => navigate('/login')} className="font-semibold text-primary">Log in</button>
      </p>
    </div>
  )
}
