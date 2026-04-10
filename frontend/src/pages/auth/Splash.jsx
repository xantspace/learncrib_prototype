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
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center animate-slide-up">
        <img src="/assets/img/logo_b.png" alt="LearnCrib" className="w-48 object-contain mb-5" />
        <p className="font-outfit text-white text-lg font-medium opacity-90 tracking-wide">
          Where Learning Feels Like Home
        </p>
      </div>
    </div>
  )
}
