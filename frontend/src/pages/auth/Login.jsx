import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, LogIn } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { showToast } = useUIStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.email.trim())    errs.email    = 'Email is required'
    if (!form.password.trim()) errs.password = 'Password is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      const res = await authAPI.login(form)
      setAuth({ user: res.data.user, access: res.data.access, refresh: res.data.refresh })
      const { role } = res.data.user
      const dest = role === 'TUTOR' ? '/tutor/dashboard' : role === 'ADMIN' ? '/admin' : '/student/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password.'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col px-6 pt-12 pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-secondary/60 mb-8">
        ← Back
      </button>

      <div className="mb-5 animate-slide-up text-center">
        <img src="/assets/img/logo_b.png" alt="LearnCrib" className="h-10 mb-4 object-contain mx-auto logo-adaptive" />
        <h1 className="font-outfit font-bold text-3xl text-secondary mt-2">Welcome back</h1>
        <p className="font-inter text-sm text-secondary/55 mt-1">Login to continue your learning journey</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Input
          icon={Mail}
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRemember(v => !v)}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${
                remember ? 'bg-primary' : 'bg-secondary/15'
              }`}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
                style={{ transform: remember ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </div>
            <span className="text-xs font-inter text-secondary/60">Remember me</span>
          </label>
          <button type="button" className="text-xs font-inter font-medium text-primary">
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="full" loading={loading} className="mt-2">
          <LogIn size={16} /> Login
        </Button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-inter text-secondary/40">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social buttons (UI only — OAuth not in scope for MVP) */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="bg-gray-50 border border-secondary/15 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 text-sm font-inter font-medium text-secondary hover:border-secondary/30 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button type="button" className="bg-gray-50 border border-secondary/15 rounded-2xl flex items-center justify-center gap-2 py-3 px-4 text-sm font-inter font-medium text-secondary hover:border-secondary/30 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        </div>
      </form>

      <p className="mt-auto text-center text-sm font-inter text-secondary/55 pt-8">
        Don't have an account?{' '}
        <button onClick={() => navigate('/role')} className="font-semibold text-primary">Sign up</button>
      </p>
    </div>
  )
}
