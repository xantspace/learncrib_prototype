import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { X, Navigation, Search, ChevronRight, Star } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import Button from '@/components/ui/Button'
import { usersAPI } from '@/services/api'

// Custom marker icons
function createTutorMarker(isOnline, initials) {
  const html = renderToStaticMarkup(
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: isOnline ? '#1939D4' : '#9CA3AF',
      border: '3px solid white',
      boxShadow: '0 4px 12px rgba(25,57,212,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: 14,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
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

export default function MapView() {
  const navigate  = useNavigate()
  const [userCoords, setUserCoords] = useState(null)
  const [tutors,     setTutors]     = useState([])
  const [selected,   setSelected]   = useState(null)
  const [locating,   setLocating]   = useState(true)

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback: Lagos coordinates
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
        setUserCoords([6.5244, 3.3792]) // Lagos fallback
        setLocating(false)
      },
      { timeout: 8000 }
    )
  }, [])

  // Load nearby tutors when coords known
  useEffect(() => {
    if (!userCoords) return
    usersAPI.getNearbyTutors({
      lat: userCoords[0],
      lng: userCoords[1],
      radius: 10,
    }).then(r => {
      setTutors(Array.isArray(r.data) ? r.data : r.data?.results || [])
    }).catch(() => {
      // Use mock data while API is not ready
      setTutors(MOCK_TUTORS(userCoords))
    })
  }, [userCoords])

  if (locating) return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="font-inter text-sm text-secondary/60">Finding your location…</p>
    </div>
  )

  return (
    <div className="fixed inset-0">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-12 left-4 z-[1000] w-10 h-10 bg-white rounded-2xl shadow-glass flex items-center justify-center"
      >
        <X size={18} className="text-secondary" />
      </button>

      {/* Title */}
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

        {/* Tutor markers */}
        {tutors.map(tutor => {
          if (!tutor.latitude || !tutor.longitude) return null
          const initials = `${tutor.first_name?.[0]}${tutor.last_name?.[0]}`.toUpperCase()
          return (
            <Marker
              key={tutor.id}
              position={[tutor.latitude, tutor.longitude]}
              icon={createTutorMarker(tutor.is_available, initials)}
              eventHandlers={{ click: () => setSelected(tutor) }}
            />
          )
        })}
      </MapContainer>

      {/* Tutor bottom sheet */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 animate-slide-up">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-outfit font-bold text-white text-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1939D4, #0F2391)' }}>
                {`${selected.first_name?.[0]}${selected.last_name?.[0]}`.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-outfit font-semibold text-base text-secondary">
                  {selected.first_name} {selected.last_name}
                </h3>
                <p className="font-inter text-xs text-secondary/50">
                  {(selected.subjects || []).join(' · ')}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {selected.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-accent fill-current" />
                      <span className="text-xs font-semibold">{selected.rating}</span>
                    </div>
                  )}
                  <span className="font-outfit font-bold text-sm text-primary">
                    ₦{Number(selected.hourly_rate).toLocaleString()}/hr
                  </span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-secondary/30">
                <X size={18} />
              </button>
            </div>
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
          onClick={() => {}}
          className="absolute bottom-36 right-4 z-[1000] w-10 h-10 bg-white rounded-2xl shadow-glass flex items-center justify-center"
        >
          <Navigation size={16} className="text-primary" />
        </button>
      )}
    </div>
  )
}

// Mock nearby tutors for development (offset from user position)
function MOCK_TUTORS(center) {
  const offsets = [[0.008, 0.005],[-0.004, 0.010],[0.012,-0.007],[-0.010, 0.003],[0.006, 0.015]]
  const names = [
    ['Kolade','Okonkwo'],['Fatima','Bello'],['Chidi','Abiodun'],['Tunde','Nwosu'],['Zainab','Ibrahim'],
  ]
  return offsets.map(([dlat, dlng], i) => ({
    id: `mock-${i}`,
    first_name: names[i][0], last_name: names[i][1],
    subjects: ['Mathematics','Physics'],
    hourly_rate: 2500 + i * 500,
    rating: (4.5 + i * 0.1).toFixed(1),
    total_reviews: 20 + i * 15,
    is_available: i % 3 !== 0,
    latitude: center[0] + dlat,
    longitude: center[1] + dlng,
    distance_km: Math.abs(dlat * 111).toFixed(1),
  }))
}
