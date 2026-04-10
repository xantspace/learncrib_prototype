import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Users, Star, CheckCircle, TrendingUp, MessageCircle, MapPin, Video } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { sessionsAPI, payoutsAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

export default function TutorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [sessions,  setSessions]  = useState([])
  const [earnings,  setEarnings]  = useState(null)
  const [available, setAvailable] = useState(true)
  const [loading,   setLoading]   = useState(true)

  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase()

  useEffect(() => {
    Promise.all([
      sessionsAPI.list().catch(() => ({ data: [] })),
      payoutsAPI.getEarnings().catch(() => ({ data: null })),
    ]).then(([sRes, eRes]) => {
      setSessions(Array.isArray(sRes.data) ? sRes.data : sRes.data?.results || [])
      setEarnings(eRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const toggleAvailability = async () => {
    const next = !available
    setAvailable(next)
    try {
      await api.patch('/api/users/me/', { is_available: next })
    } catch {
      setAvailable(!next) // revert on fail
    }
  }

  const upcoming = sessions.filter(s => ['ACCEPTED','SCHEDULED'].includes(s.status)).slice(0, 3)
  const totalStudents = new Set(sessions.map(s => s.parent_id)).size

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <img src="/assets/img/logo_b.png" alt="LearnCrib" className="h-6 object-contain" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-inter text-xs text-secondary/50">Tutor Dashboard</p>
            <h1 className="font-outfit font-bold text-xl text-secondary">Hello, {user?.first_name} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-glass border border-white/45 shadow-glass flex items-center justify-center">
              <Bell size={18} className="text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
            <button
              onClick={() => navigate('/tutor/profile/edit')}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}
            >
              {initials}
            </button>
          </div>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="px-5 mb-5">
        <GlassCard className="p-4 flex items-center justify-between" hover={false}>
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${available ? 'bg-success animate-pulse-ring' : 'bg-gray-300'}`} />
            <div>
              <p className="font-outfit font-semibold text-sm text-secondary">
                {available ? 'Available for sessions' : 'Currently offline'}
              </p>
              <p className="font-inter text-xs text-secondary/50">
                {available ? 'Students can book you now' : 'Toggle to go online'}
              </p>
            </div>
          </div>
          <div
            onClick={toggleAvailability}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${available ? 'bg-primary' : 'bg-secondary/25'}`}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300"
              style={{ transform: available ? 'translateX(26px)' : 'translateX(2px)' }}
            />
          </div>
        </GlassCard>
      </div>

      {/* Earnings banner */}
      <div className="px-5 mb-5">
        <button
          onClick={() => navigate('/tutor/earnings')}
          className="block w-full rounded-3xl p-5 text-left"
          style={{ background: 'linear-gradient(135deg, #0A1444 0%, hsl(220,50%,25%) 100%)' }}
        >
          <p className="font-inter text-xs text-white/60 mb-1">Total Earnings This Month</p>
          <h2 className="font-outfit font-bold text-4xl text-white mb-1">
            ₦{Number(earnings?.month_total || 0).toLocaleString()}
          </h2>
          <p className="font-inter text-xs text-white/60 mb-4">
            {earnings?.month_change >= 0 ? '+' : ''}₦{Number(earnings?.month_change || 0).toLocaleString()} from last month
          </p>
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Today"    value={`₦${Number(earnings?.today || 0).toLocaleString()}`} />
            <StatTile label="This Week" value={`₦${Number(earnings?.week_total || 0).toLocaleString()}`} />
            <StatTile label="Pending"  value={`₦${Number(earnings?.pending || 0).toLocaleString()}`} />
          </div>
        </button>
      </div>

      {/* Quick stats */}
      <div className="px-5 mb-5">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users}       color="primary-light"          iconColor="text-primary"   label="Total Students" value={totalStudents} />
          <StatCard icon={Star}        color="[hsla(45,100%,50%,0.12)]" iconColor="text-accent"  label="Avg Rating"     value={user?.rating || '–'} />
          <StatCard icon={CheckCircle} color="primary-light"          iconColor="text-primary"   label="Sessions Done"  value={sessions.filter(s => s.status === 'COMPLETED').length} />
          <StatCard icon={TrendingUp}  color="[rgba(26,43,68,.08)]"   iconColor="text-secondary" label="Active Now"     value={upcoming.length} />
        </div>
      </div>

      {/* Upcoming sessions */}
      <div className="px-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-outfit font-bold text-lg text-secondary">Upcoming Sessions</h2>
          <button onClick={() => navigate('/tutor/students')} className="text-xs font-inter font-medium text-primary">See all</button>
        </div>
        {loading
          ? [1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-shimmer mb-3" />)
          : upcoming.length > 0
            ? upcoming.map(s => <UpcomingSessionCard key={s.id} session={s} navigate={navigate} />)
            : <p className="font-inter text-sm text-secondary/50 text-center py-8">No upcoming sessions</p>
        }
      </div>
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl p-3 text-center">
      <p className="font-outfit font-bold text-lg text-white">{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  )
}

function StatCard({ icon: Icon, color, iconColor, label, value }) {
  return (
    <GlassCard className="p-4 flex items-center gap-3" hover={false}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-${color}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div>
        <p className="font-outfit font-bold text-2xl text-secondary">{value}</p>
        <p className="font-inter text-xs text-secondary/50">{label}</p>
      </div>
    </GlassCard>
  )
}

function UpcomingSessionCard({ session, navigate }) {
  const studentName = `${session.student_first_name || 'Student'} ${session.student_last_name || ''}`.trim()
  const initials = `${session.student_first_name?.[0] || 'S'}${session.student_last_name?.[0] || ''}`.toUpperCase()
  const date = session.scheduled_at
    ? new Date(session.scheduled_at).toLocaleString('en-NG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <GlassCard className="p-4 flex items-center gap-4 mb-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-outfit font-bold text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, hsl(340,70%,55%), hsl(340,50%,40%))' }}>
        {initials}
      </div>
      <div className="flex-1">
        <h4 className="font-outfit font-semibold text-sm text-secondary">{studentName}</h4>
        <p className="font-inter text-xs text-secondary/50">{session.subject} · {session.duration_minutes || 60} min</p>
        <p className="font-inter text-xs text-primary font-medium mt-0.5">{date}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <button onClick={() => navigate('/messages')}
          className="w-8 h-8 rounded-xl bg-white/70 border border-white/45 shadow-glass flex items-center justify-center">
          <MessageCircle size={15} className="text-primary" />
        </button>
        <button className="w-8 h-8 rounded-xl bg-white/70 border border-white/45 shadow-glass flex items-center justify-center">
          <Video size={15} className="text-secondary" />
        </button>
      </div>
    </GlassCard>
  )
}
