/**
 * tutorRanking.js — Tutor score and sort engine
 *
 * Scoring is intentionally transparent and configurable.
 * Backend can later return pre-computed scores; until then this runs client-side.
 *
 * Score is a number 0–100. Weights are additive:
 *   Availability     : 30 pts   (online + accepts_bookings matters most)
 *   Rating           : 25 pts   (0–5 → 0–25)
 *   Proximity        : 25 pts   (inverse distance, capped at 20 km)
 *   Session count    : 12 pts   (log-scaled; 50+ sessions → max)
 *   Completion rate  : 8 pts    (0–100% → 0–8)
 */

const WEIGHTS = {
  availability:   30,
  rating:         25,
  proximity:      25,
  sessionCount:   12,
  completionRate:  8,
}

/**
 * Compute a single tutor's score.
 * @param {object} tutor  — Tutor data object
 * @param {number} [studentLat] — Student latitude (for proximity component)
 * @param {number} [studentLng] — Student longitude
 * @returns {number} score 0–100
 */
export function computeTutorScore(tutor, studentLat, studentLng) {
  let score = 0

  // ── Availability (30 pts) ──────────────────────────────────────────────────
  // is_available: visible + accepting bookings
  // online (is_available===true) earns full weight; offline earns 0
  score += tutor.is_available ? WEIGHTS.availability : 0

  // ── Rating (25 pts) ───────────────────────────────────────────────────────
  const rating = parseFloat(tutor.rating) || 0
  score += (rating / 5) * WEIGHTS.rating

  // ── Proximity (25 pts) ────────────────────────────────────────────────────
  // Use pre-computed distance_km if available, otherwise calculate from coords.
  let distKm = parseFloat(tutor.distance_km)
  if (isNaN(distKm) && studentLat != null && tutor.latitude != null) {
    distKm = haversineKm(studentLat, studentLng, tutor.latitude, tutor.longitude)
  }
  if (!isNaN(distKm)) {
    // Score decays linearly: 0 km → 25 pts, 20 km → 0 pts
    const MAX_DIST = 20
    score += Math.max(0, (1 - distKm / MAX_DIST)) * WEIGHTS.proximity
  }

  // ── Session count (12 pts) — log-scaled ──────────────────────────────────
  const sessions = Number(tutor.total_reviews ?? tutor.sessions ?? tutor.total_sessions ?? 0)
  if (sessions > 0) {
    // log(50) ≈ 3.9; cap at that
    const LOG_MAX = Math.log(50)
    score += Math.min(1, Math.log(sessions) / LOG_MAX) * WEIGHTS.sessionCount
  }

  // ── Completion rate (8 pts) ───────────────────────────────────────────────
  const completionRate = parseFloat(tutor.completion_rate ?? tutor.completionRate ?? 100)
  score += (completionRate / 100) * WEIGHTS.completionRate

  return Math.round(score * 10) / 10  // one decimal place
}

/**
 * Filter, score, and sort a list of tutors.
 *
 * @param {object[]} tutors       — Raw tutor list from API or mock data
 * @param {object}   [options]
 * @param {number}   [options.studentLat]
 * @param {number}   [options.studentLng]
 * @param {boolean}  [options.verifiedOnly]  — When true, filter to APPROVED only
 * @param {object}   [options.verificationStore] — verificationStore instance for status lookups
 * @returns {object[]} sorted tutors with _score injected
 */
export function rankTutors(tutors, { studentLat, studentLng, verifiedOnly = true, verificationStore } = {}) {
  return tutors
    .map(t => {
      // Determine verification status from store if provided, fall back to field on tutor
      const storeStatus = verificationStore?.getRecord(t.email)?.status
      const verStatus   = storeStatus ?? t.verification_status ?? 'UNVERIFIED'
      return { ...t, _verificationStatus: verStatus }
    })
    .filter(t => {
      if (!verifiedOnly) return true
      return t._verificationStatus === 'APPROVED'
    })
    .map(t => ({
      ...t,
      _score: computeTutorScore(t, studentLat, studentLng),
    }))
    .sort((a, b) => {
      // Primary: availability (available tutors always before unavailable)
      if (a.is_available !== b.is_available) return a.is_available ? -1 : 1
      // Secondary: score
      return b._score - a._score
    })
}

/**
 * Haversine distance between two lat/lng pairs in km.
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R   = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a   = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) { return deg * (Math.PI / 180) }

/**
 * Score label for UI display.
 * @param {number} score
 * @returns {{ label: string, color: string }}
 */
export function scoreLabel(score) {
  if (score >= 75) return { label: 'Top Pick',  color: '#1939D4' }
  if (score >= 55) return { label: 'Great',      color: '#16A34A' }
  if (score >= 35) return { label: 'Good',       color: '#D97706' }
  return              { label: 'Available',    color: '#6B7280' }
}
