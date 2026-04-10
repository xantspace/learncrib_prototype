import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, MapPin, Star, X } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import PageHeader from '@/components/shared/PageHeader'
import { TutorCardSkeleton } from '@/components/ui/Skeleton'
import { usersAPI } from '@/services/api'

export default function SearchResults() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query,    setQuery]    = useState(params.get('q') || '')
  const [tutors,   setTutors]   = useState([])
  const [loading,  setLoading]  = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [maxDist,  setMaxDist]  = useState(10)
  const [maxRate,  setMaxRate]  = useState(10000)

  const search = async () => {
    setLoading(true)
    try {
      const res = await usersAPI.getTutors({ q: query, max_distance: maxDist, max_rate: maxRate })
      setTutors(Array.isArray(res.data) ? res.data : res.data?.results || [])
    } catch {
      setTutors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { search() }, [])

  const name = (t) => `${t.first_name} ${t.last_name}`
  const initials = (t) => `${t.first_name?.[0]}${t.last_name?.[0]}`.toUpperCase()

  return (
    <div>
      <PageHeader title="Search Tutors" />
      <div className="px-5">
        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/45" />
            <input
              type="text"
              placeholder="Subject, tutor name…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              className="w-full py-3 pl-10 pr-4 border border-secondary/15 rounded-2xl font-inter text-sm bg-white/80 text-secondary outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilter(f => !f)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${showFilter ? 'bg-primary border-primary' : 'bg-white border-secondary/15'}`}
          >
            <SlidersHorizontal size={16} className={showFilter ? 'text-white' : 'text-secondary'} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <GlassCard className="p-4 mb-4 animate-slide-up" hover={false}>
            <div className="mb-4">
              <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/45 mb-2">
                Max Distance: {maxDist} km
              </p>
              <input type="range" min={1} max={50} value={maxDist} onChange={e => setMaxDist(Number(e.target.value))}
                className="w-full accent-primary" />
            </div>
            <div className="mb-4">
              <p className="font-inter text-xs font-semibold uppercase tracking-widest text-secondary/45 mb-2">
                Max Rate: ₦{maxRate.toLocaleString()}/hr
              </p>
              <input type="range" min={500} max={20000} step={500} value={maxRate} onChange={e => setMaxRate(Number(e.target.value))}
                className="w-full accent-primary" />
            </div>
            <button onClick={search} className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold font-outfit">
              Apply Filters
            </button>
          </GlassCard>
        )}

        {/* Results */}
        <p className="font-inter text-xs text-secondary/40 mb-3">
          {loading ? 'Searching…' : `${tutors.length} tutor${tutors.length !== 1 ? 's' : ''} found`}
        </p>

        <div className="flex flex-col gap-3">
          {loading
            ? [1,2,3,4].map(i => <TutorCardSkeleton key={i} />)
            : tutors.length > 0
              ? tutors.map(tutor => (
                  <GlassCard
                    key={tutor.id}
                    className="p-4 flex items-center gap-4"
                    onClick={() => navigate(`/student/tutor/${tutor.id}`)}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
                      {initials(tutor)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-outfit font-semibold text-base text-secondary">{name(tutor)}</h3>
                        <span className="font-outfit font-bold text-sm text-primary ml-2">₦{Number(tutor.hourly_rate).toLocaleString()}/hr</span>
                      </div>
                      <p className="font-inter text-xs text-secondary/50 mt-0.5">{(tutor.subjects || []).join(' · ')}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {tutor.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-accent fill-current" />
                            <span className="font-inter text-xs font-semibold">{tutor.rating}</span>
                          </div>
                        )}
                        {tutor.distance_km != null && (
                          <div className="flex items-center gap-1 text-secondary/40">
                            <MapPin size={11} /><span className="text-xs">{tutor.distance_km.toFixed(1)} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))
              : (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="font-outfit font-semibold text-secondary">No tutors found</p>
                  <p className="font-inter text-sm text-secondary/50 mt-1">Try adjusting your filters</p>
                </div>
              )
          }
        </div>
      </div>
    </div>
  )
}
