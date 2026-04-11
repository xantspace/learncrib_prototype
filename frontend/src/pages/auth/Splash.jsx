import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Splash() {
  const navigate = useNavigate()
  const { accessToken, user } = useAuthStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (accessToken && user) {
        navigate(user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard', { replace: true })
      } else {
        navigate('/welcome', { replace: true })
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0A1444 0%, #1939D4 45%, #2B6CB0 75%, #1a4a8a 100%)',
      }}
    >
      {/* Decorative background orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #6B8FFF 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #00C9BC 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
      <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #F0B429 0%, transparent 70%)' }} />

      {/* Logo + branding */}
      <div className="flex flex-col items-center animate-slide-up relative z-10">
        {/* Logo icon — rounded with glow */}
        <img
          src="/assets/img/logo_icon.png"
          alt="LearnCrib"
          className="w-28 h-28 rounded-3xl object-cover mb-5"
          style={{ boxShadow: '0 0 50px rgba(107,143,255,0.55)' }}
        />

        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-outfit font-bold text-white text-2xl tracking-tight">LearnCrib</span>
          <span className="font-outfit text-white/50 text-xs self-start mt-1">™</span>
        </div>

        {/* Slogan */}
        <p className="font-inter text-white/70 text-sm font-medium tracking-wide text-center px-8">
          Book a Tutor! Build a Future!
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex items-center gap-2">
        {[0, 0.3, 0.6].map((delay, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  )
}
