import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, ChevronRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'
import { sessionsAPI } from '@/services/api'

export default function TutorStudents() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    sessionsAPI.list()
      .then(r => setSessions(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .finally(() => setLoading(false))
  }, [])

  // Deduplicate students
  const students = Object.values(
    sessions.reduce((acc, s) => {
      const key = s.parent_id
      if (!acc[key]) acc[key] = { ...s, session_count: 0 }
      acc[key].session_count++
      return acc
    }, {})
  )

  return (
    <div>
      <PageHeader title="My Students" back={false} />
      <div className="px-5 flex flex-col gap-3">
        {loading
          ? [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-shimmer" />)
          : students.length > 0
            ? students.map(s => (
                <GlassCard key={s.parent_id} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-outfit font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,hsl(220,60%,55%),hsl(220,40%,40%))' }}>
                    {`${s.student_first_name?.[0] || 'S'}${s.student_last_name?.[0] || ''}`.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-outfit font-semibold text-sm text-secondary">
                      {s.student_first_name} {s.student_last_name}
                    </p>
                    <p className="font-inter text-xs text-secondary/50">{s.session_count} session{s.session_count !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={() => navigate('/messages')} className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center">
                    <MessageCircle size={14} className="text-primary" />
                  </button>
                </GlassCard>
              ))
            : (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">👥</div>
                <p className="font-outfit font-semibold text-secondary">No students yet</p>
                <p className="font-inter text-sm text-secondary/50 mt-1">Make sure you're available to receive bookings</p>
              </div>
            )
        }
      </div>
    </div>
  )
}
