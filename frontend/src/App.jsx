import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import AppShell from '@/components/layout/AppShell'

// ── Lazy-loaded pages ─────────────────────────
// Auth
const Splash      = lazy(() => import('@/pages/auth/Splash'))
const Welcome     = lazy(() => import('@/pages/auth/Welcome'))
const RoleSelect  = lazy(() => import('@/pages/auth/RoleSelect'))
const Login       = lazy(() => import('@/pages/auth/Login'))
const Signup      = lazy(() => import('@/pages/auth/Signup'))
const Onboarding  = lazy(() => import('@/pages/auth/Onboarding'))

// Student
const StudentDashboard  = lazy(() => import('@/pages/student/Dashboard'))
const SearchResults     = lazy(() => import('@/pages/student/SearchResults'))
const TutorProfile      = lazy(() => import('@/pages/student/TutorProfile'))
const BookSession       = lazy(() => import('@/pages/student/BookSession'))
const Payment           = lazy(() => import('@/pages/student/Payment'))
const BookingConfirm    = lazy(() => import('@/pages/student/BookingConfirmation'))
const StudentSessions   = lazy(() => import('@/pages/student/Sessions'))
const StudentProfile    = lazy(() => import('@/pages/student/Profile'))
const MapView           = lazy(() => import('@/pages/student/MapView'))

// Tutor
const TutorDashboard    = lazy(() => import('@/pages/tutor/Dashboard'))
const TutorAvailability = lazy(() => import('@/pages/tutor/Availability'))
const TutorEarnings     = lazy(() => import('@/pages/tutor/Earnings'))
const TutorStudents     = lazy(() => import('@/pages/tutor/Students'))
const TutorSessions     = lazy(() => import('@/pages/tutor/Sessions'))
const TutorProfileEdit  = lazy(() => import('@/pages/tutor/ProfileEdit'))
const TutorProfileView  = lazy(() => import('@/pages/tutor/Profile'))

// Shared
const MessagesInbox = lazy(() => import('@/pages/shared/MessagesInbox'))
const Messages      = lazy(() => import('@/pages/shared/Messages'))
const Notifications = lazy(() => import('@/pages/shared/Notifications'))
const Settings      = lazy(() => import('@/pages/shared/Settings'))
const HelpSupport   = lazy(() => import('@/pages/shared/HelpSupport'))

// Payment / Review
const PaymentVerify    = lazy(() => import('@/pages/student/PaymentVerify'))
const ReviewSession    = lazy(() => import('@/pages/student/ReviewSession'))

// Settings sub-pages
const PersonalInfo     = lazy(() => import('@/pages/settings/PersonalInfo'))
const Security         = lazy(() => import('@/pages/settings/Security'))
const NotificationPrefs= lazy(() => import('@/pages/settings/NotificationPrefs'))
const Preferences      = lazy(() => import('@/pages/settings/Preferences'))
const PaymentMethods   = lazy(() => import('@/pages/settings/PaymentMethods'))
const BankAccount      = lazy(() => import('@/pages/settings/BankAccount'))

// ── Route guards ─────────────────────────────
function RequireAuth({ children }) {
  const { accessToken } = useAuthStore()
  if (!accessToken) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ role, children }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    const dest = user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

function RequireGuest({ children }) {
  const { accessToken, user } = useAuthStore()
  if (accessToken && user) {
    const dest = user.role === 'TUTOR' ? '/tutor/dashboard' : '/student/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

// ── Page loader ───────────────────────────────
function PageLoader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0A1444 0%, #1939D4 50%, #2B6CB0 100%)' }}
    >
      {/* Glow ring */}
      <div className="w-28 h-28 rounded-[36px] flex items-center justify-center mb-6"
        style={{ boxShadow: '0 0 40px hsla(220,80%,60%,0.5)', background: 'rgba(255,255,255,0.08)' }}>
        <img src="/assets/img/logo_icon.png" alt="LearnCrib" className="w-20 h-20 rounded-[28px] animate-logo-spin" />
      </div>
      <p className="font-outfit font-bold text-white text-xl tracking-wide mb-1">LearnCrib</p>
      <p className="font-inter text-[0.7rem] uppercase tracking-[0.25em] text-white/50 animate-pulse">
        Loading…
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public / Auth ── */}
        <Route path="/"          element={<Splash />} />
        <Route path="/welcome"   element={<RequireGuest><Welcome /></RequireGuest>} />
        <Route path="/role"      element={<RequireGuest><RoleSelect /></RequireGuest>} />
        <Route path="/login"     element={<RequireGuest><Login /></RequireGuest>} />
        <Route path="/signup"    element={<RequireGuest><Signup /></RequireGuest>} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

        {/* ── Student ── */}
        <Route path="/student/dashboard" element={
          <RequireRole role="STUDENT">
            <AppShell><StudentDashboard /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/search" element={
          <RequireRole role="STUDENT">
            <AppShell><SearchResults /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/map" element={
          <RequireRole role="STUDENT">
            <AppShell showNav={false}><MapView /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/tutor/:id" element={
          <RequireAuth><AppShell showNav={false}><TutorProfile /></AppShell></RequireAuth>
        } />
        <Route path="/student/book/:tutorId" element={
          <RequireRole role="STUDENT">
            <AppShell showNav={false}><BookSession /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/payment/:sessionId" element={
          <RequireRole role="STUDENT">
            <AppShell showNav={false}><Payment /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/booking-confirmation/:sessionId" element={
          <RequireRole role="STUDENT">
            <AppShell showNav={false}><BookingConfirm /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/sessions" element={
          <RequireRole role="STUDENT">
            <AppShell><StudentSessions /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/profile" element={
          <RequireRole role="STUDENT">
            <AppShell><StudentProfile /></AppShell>
          </RequireRole>
        } />
        <Route path="/student/review/:sessionId" element={
          <RequireRole role="STUDENT">
            <AppShell showNav={false}><ReviewSession /></AppShell>
          </RequireRole>
        } />
        <Route path="/payment/verify" element={
          <RequireAuth><AppShell showNav={false}><PaymentVerify /></AppShell></RequireAuth>
        } />

        {/* ── Tutor ── */}
        <Route path="/tutor/dashboard" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorDashboard /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/sessions" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorSessions /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/students" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorStudents /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/availability" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorAvailability /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/earnings" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorEarnings /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/profile" element={
          <RequireRole role="TUTOR">
            <AppShell><TutorProfileView /></AppShell>
          </RequireRole>
        } />
        <Route path="/tutor/profile/edit" element={
          <RequireRole role="TUTOR">
            <AppShell showNav={false}><TutorProfileEdit /></AppShell>
          </RequireRole>
        } />

        {/* ── Shared ── */}
        <Route path="/messages"      element={<RequireAuth><AppShell><MessagesInbox /></AppShell></RequireAuth>} />
        <Route path="/messages/:id"  element={<RequireAuth><AppShell showNav={false}><Messages /></AppShell></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><AppShell showNav={false}><Notifications /></AppShell></RequireAuth>} />
        <Route path="/settings"      element={<RequireAuth><AppShell showNav={false}><Settings /></AppShell></RequireAuth>} />
        <Route path="/help"          element={<RequireAuth><AppShell showNav={false}><HelpSupport /></AppShell></RequireAuth>} />

        {/* ── Settings sub-pages ── */}
        <Route path="/settings/profile"       element={<RequireAuth><AppShell showNav={false}><PersonalInfo /></AppShell></RequireAuth>} />
        <Route path="/settings/security"      element={<RequireAuth><AppShell showNav={false}><Security /></AppShell></RequireAuth>} />
        <Route path="/settings/notifications" element={<RequireAuth><AppShell showNav={false}><NotificationPrefs /></AppShell></RequireAuth>} />
        <Route path="/settings/preferences"   element={<RequireAuth><AppShell showNav={false}><Preferences /></AppShell></RequireAuth>} />
        <Route path="/settings/payment"       element={<RequireAuth><AppShell showNav={false}><PaymentMethods /></AppShell></RequireAuth>} />
        <Route path="/settings/bank"          element={<RequireAuth><AppShell showNav={false}><BankAccount /></AppShell></RequireAuth>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
