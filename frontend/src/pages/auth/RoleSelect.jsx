import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, UserCheck, ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'

export default function RoleSelect() {
  const navigate = useNavigate()
  const [role, setRole] = useState('STUDENT')

  return (
    <div className="min-h-svh flex flex-col px-6 pt-16 pb-10"
      style={{ background: 'linear-gradient(160deg, hsl(175,60%,96%) 0%, white 50%, hsl(220,40%,97%) 100%)' }}
    >
      <div className="mb-10 animate-slide-up text-center">
        <img src="/assets/img/logo_b.png" alt="LearnCrib" className="h-8 mb-5 object-contain mx-auto logo-adaptive" />
        <h1 className="font-outfit font-bold text-3xl text-secondary">I am a…</h1>
        <p className="font-inter text-sm text-secondary/55 mt-1">Choose your role to continue</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {/* Student */}
        <GlassCard
          onClick={() => setRole('STUDENT')}
          className={`p-6 flex flex-col items-center gap-3 border-2 transition-all duration-300 ${
            role === 'STUDENT' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            role === 'STUDENT' ? 'bg-primary-light' : 'bg-secondary/8'
          }`}>
            <GraduationCap size={22} className={role === 'STUDENT' ? 'text-primary' : 'text-secondary/50'} />
          </div>
          <span className="font-outfit font-semibold text-sm text-secondary">Student</span>
          <span className="text-xs font-inter text-center text-secondary/50">Find & book tutors</span>
        </GlassCard>

        {/* Tutor */}
        <GlassCard
          onClick={() => setRole('TUTOR')}
          className={`p-6 flex flex-col items-center gap-3 border-2 transition-all duration-300 ${
            role === 'TUTOR' ? 'border-primary' : 'border-transparent'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            role === 'TUTOR' ? 'bg-primary-light' : 'bg-secondary/8'
          }`}>
            <UserCheck size={22} className={role === 'TUTOR' ? 'text-primary' : 'text-secondary/50'} />
          </div>
          <span className="font-outfit font-semibold text-sm text-secondary">Tutor</span>
          <span className="text-xs font-inter text-center text-secondary/50">Teach & earn</span>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        <Button size="full" onClick={() => navigate(`/signup?role=${role}`)}>
          Continue as {role === 'STUDENT' ? 'Student' : 'Tutor'}
          <ArrowRight size={16} />
        </Button>
        <p className="text-center text-sm font-inter text-secondary/55">
          Already have an account?{' '}
          <button onClick={() => navigate('/login')} className="font-semibold text-primary">
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
