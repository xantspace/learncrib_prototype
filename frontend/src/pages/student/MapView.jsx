import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { X, Navigation, Star, BadgeCheck } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import VerifiedBadge from '@/components/ui/VerifiedBadge'
import { usersAPI } from '@/services/api'
import { useVerificationStore } from '@/store/verificationStore'
import { rankTutors, scoreLabel } from '@/utils/tutorRanking'

// ── Marker factories ─────────────────────────────────────────────────────────

function createTutorMarker(tutor, rank) {
  const isOnline  = tutor.is_available
  const isTopPick = rank === 0   // highest-ranked tutor gets gold ring
  const initials  = `${tutor.first_name?.[0] ?? ''}${tutor.last_name?.[0] ?? ''}`.toUpperCase()
  const bg        = isTopPick ? '#F59E0B' : isOnline ? '#1939D4' : '#9CA3AF'
  const ring      = isTopPick ? '3px solid #FDE68A' : '3px solid white'

  const html = renderToStaticMarkup(
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: bg,
      border: ring,
      boxShadow: isTopPick
        ? '0 4px 16px rgba(245,158,11,0.5)'
        : '0 4px 12px rgba(25,57,212,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 14,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      position: 'relative',
    }}>
      {initials}
    </div>
  )
  return divIcon({ html, className: '', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -24] })
}

function createStudentMarker() {
  const html = renderToStaticMarkup(
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      background: '#1939D4',
      border: '3px solid white',
      boxShadow: '0 0 0 6px rgba(25,57,212,0.2)',
    }} />
  )
  return divIcon({ html, className: '', iconSize: [20, 20], iconAnchor: [10, 10] })
}

function FlyToUser({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { duration: 1.5 })
  }, [coords])
  return null
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapView() {
  const navigate      = useNavigate()
  const vStore        = useVerificationStore()

  const [userCoords, setUserCoords] = useState(null)
  const [rawTutors,  setRawTutors]  = useState([])
  const [selected,   setSelected]   = useState(null)
  const [locating,   setLocating]   = useState(true)
  const mapRef = useRef(null)

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserCoords([6.5244, 3.3792])
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      () => {
        setUserCoords([6.5244, 3.3792])
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }, [])

  // Load nearby tutors when coords are known
  useEffect(() => {
    if (!userCoords) return
    usersAPI.getNearbyTutors({
      lat: userCoords[0],
      lng: userCoords[1],
      radius: 10,
    })
      .then(r => setRawTutors(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => setRawTutors([]))
  }, [userCoords])

  // Rank tutors: filter verified → score → sort
  const tutors = rankTutors(rawTutors, {
    studentLat: userCoords?.[0],
    studentLng: userCoords?.[1],
    verifiedOnly: true,
    verificationStore: vStore,
  })

  if (locating) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="font-inter text-sm text-secondary/60">Finding your location…</p>
    </div>
  )

  const topPick    = tutors[0] ?? null
  const sl         = selected ? scoreLabel(selected._score ?? 0) : null

  return (
    <div className="fixed inset-0">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 left-4 z-[1000] w-10 h-10 bg-white rounded-2xl shadow-glass flex items-center justify-center"
      >
        <X size={18} className="text-secondary" />
      </button>

      {/* Title pill */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-glass rounded-2xl px-4 py-2 shadow-glass">
        <p className="font-outfit font-semibold text-sm text-secondary">
          {tutors.length} Tutors Nearby
        </p>
      </div>

      {/* Map */}
      <MapContainer
        center={userCoords || [6.5244, 3.3792]}
        zoom={14}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap'
        />

        <FlyToUser coords={userCoords} />

        {/* Student location */}
        {userCoords && (
          <>
            <Marker position={userCoords} icon={createStudentMarker()} />
            <Circle
              center={userCoords}
              radius={800}
              pathOptions={{ color: '#1939D4', fillColor: '#1939D4', fillOpacity: 0.06, weight: 1 }}
            />
          </>
        )}

        {/* Tutor markers — ranked order */}
        {tutors.map((tutor, index) => {
          if (!tutor.latitude || !tutor.longitude) return null
          return (
            <Marker
              key={tutor.id}
              position={[tutor.latitude, tutor.longitude]}
              icon={createTutorMarker(tutor, index)}
              eventHandlers={{ click: () => setSelected(tutor) }}
            />
          )
        })}
      </MapContainer>

      {/* Top pick banner — shown when no tutor selected */}
      {!selected && topPick && topPick.is_available && (
        <div className="absolute bottom-32 left-4 right-4 z-[1000] animate-slide-up">
          <button
            onClick={() => setSelected(topPick)}
            className="w-full flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-glass border border-yellow-200"
          >
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-outfit font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {`${topPick.first_name?.[0]}${topPick.last_name?.[0]}`.toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-outfit font-semibold text-sm text-secondary">
                  {topPick.first_name} {topPick.last_name}
                </span>
                {topPick._verificationStatus === 'APPROVED' && (
                  <BadgeCheck size={13} className="text-primary flex-shrink-0" />
                )}
              </div>
              <p className="font-inter text-xs text-secondary/50 truncate">
                {(topPick.subjects || []).join(' · ')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                Top Pick
              </span>
              <span className="font-inter text-[10px] text-secondary/40">
                Score {topPick._score}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Selected tutor bottom sheet */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 animate-slide-up">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
                {`${selected.first_name?.[0]}${selected.last_name?.[0]}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-outfit font-semibold text-base text-secondary">
                    {selected.first_name} {selected.last_name}
                  </h3>
                  {selected._verificationStatus === 'APPROVED' && (
                    <BadgeCheck size={14} className="text-primary flex-shrink-0" />
                  )}
                  {sl && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: sl.color + '18', color: sl.color }}>
                      {sl.label}
                    </span>
                  )}
                </div>
                <p className="font-inter text-xs text-secondary/50 mt-0.5">
                  {(selected.subjects || []).join(' · ')}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {parseFloat(selected.rating) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-accent fill-current" />
                      <span className="text-xs font-semibold">{selected.rating}</span>
                    </div>
                  )}
                  <span className="font-outfit font-bold text-sm text-primary">
                    ₦{Number(selected.hourly_rate).toLocaleString()}/hr
                  </span>
                  {selected.distance_km != null && (
                    <span className="font-inter text-xs text-secondary/40">
                      {parseFloat(selected.distance_km).toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-secondary/30 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Score bar */}
            {selected._score != null && (
              <div className="mt-3 mb-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-inter text-[10px] text-secondary/40 uppercase tracking-wider">Match Score</span>
                  <span className="font-inter text-xs font-semibold text-secondary">{selected._score}/100</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selected._score}%`,
                      background: sl?.color ?? '#1939D4',
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button variant="ghost" size="sm" className="flex-1"
                onClick={() => navigate(`/student/tutor/${selected.id}`)}>
                View Profile
              </Button>
              <Button size="sm" className="flex-1"
                onClick={() => navigate(`/student/book/${selected.id}`)}>
                Book Now
              </Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Recenter button */}
      {userCoords && (
        <button
          onClick={() => mapRef.current?.flyTo(userCoords, 14)}
          className="absolute bottom-36 right-4 z-[1000] w-10 h-10 bg-white rounded-2xl shadow-glass flex items-center justify-center"
        >
          <Navigation size={16} className="text-primary" />
        </button>
      )}
    </div>
  )
}

