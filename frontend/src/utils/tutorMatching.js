/**
 * tutorMatching.js — Matching engine service layer
 *
 * Responsibilities:
 * 1. Filter tutors by subject, availability, verification
 * 2. Rank filtered candidates using tutorRanking.js
 * 3. Simulate dispatch + acceptance (until real-time backend exists)
 * 4. Expose clean async API that mirrors what a real WS/polling endpoint would look like
 */
import { rankTutors } from '@/utils/tutorRanking'

export const MATCH_TIMEOUT_MS  = 60_000   // 60s before timeout
export const MAX_CANDIDATES    = 5        // top N tutors to contact
const  SIM_ACCEPT_MIN_MS       = 2_500    // min simulated response time
const  SIM_ACCEPT_MAX_MS       = 7_000    // max simulated response time

/**
 * Filter and rank tutors for a given subject request.
 *
 * @param {string}   subject
 * @param {object[]} tutors            — full tutor list
 * @param {object}   [opts]
 * @param {number}   [opts.studentLat]
 * @param {number}   [opts.studentLng]
 * @param {object}   [opts.verificationStore]
 * @returns {object[]} top candidates (scored, sorted)
 */
export function findCandidates(subject, tutors, { studentLat, studentLng, verificationStore } = {}) {
  // Normalise subject for comparison
  const subLower = subject.toLowerCase()

  // Step 1 — subject + availability filter
  const eligible = tutors.filter(t => {
    const matchesSubject =
      !subject ||                         // no subject = match all
      (t.subjects || []).some(s => s.toLowerCase().includes(subLower) || subLower.includes(s.toLowerCase()))
    return t.is_available && matchesSubject
  })

  // Step 2 — rank (verifiedOnly handled inside rankTutors)
  const ranked = rankTutors(eligible, {
    studentLat,
    studentLng,
    verifiedOnly: false,   // flip to true when backend marks verification_status
    verificationStore,
  })

  // Step 3 — take top N
  return ranked.slice(0, MAX_CANDIDATES)
}

/**
 * Dispatch a match request and wait for the first simulated acceptance.
 *
 * In production this would open a WebSocket or start polling.
 * Returns a Promise that resolves with the accepting tutor or rejects on timeout.
 *
 * @param {object[]} candidates  — output of findCandidates()
 * @param {object}   [opts]
 * @param {Function} [opts.onCandidateNotified]  — called as each tutor is "notified"
 * @param {AbortSignal} [opts.signal]            — cancel via AbortController
 * @returns {Promise<object>} accepting tutor
 */
export function dispatchRequest(candidates, { onCandidateNotified, signal } = {}) {
  return new Promise((resolve, reject) => {
    if (!candidates.length) {
      reject(new Error('NO_TUTORS'))
      return
    }

    // Notify tutors one by one (staggered 400ms apart) for UX effect
    candidates.forEach((tutor, i) => {
      const t = setTimeout(() => {
        if (signal?.aborted) return
        onCandidateNotified?.(tutor)
      }, i * 400)
      signal?.addEventListener('abort', () => clearTimeout(t))
    })

    // Simulate the first acceptance after a random delay
    const acceptDelay = SIM_ACCEPT_MIN_MS + Math.random() * (SIM_ACCEPT_MAX_MS - SIM_ACCEPT_MIN_MS)
    // Pick the top candidate as the one who "accepts" (highest ranked)
    const winner = candidates[0]

    const acceptTimer = setTimeout(() => {
      if (signal?.aborted) return
      resolve(winner)
    }, acceptDelay)

    // Timeout
    const timeoutTimer = setTimeout(() => {
      if (signal?.aborted) return
      reject(new Error('TIMEOUT'))
    }, MATCH_TIMEOUT_MS)

    signal?.addEventListener('abort', () => {
      clearTimeout(acceptTimer)
      clearTimeout(timeoutTimer)
      reject(new Error('CANCELLED'))
    })
  })
}

/**
 * Build a lightweight session object from a matched tutor + request.
 * This is passed to BookSession so no extra API call is needed.
 */
export function buildMatchedSession(tutor, { subject, studentLat, studentLng } = {}) {
  return {
    tutorId:     tutor.id,
    tutorName:   `${tutor.first_name} ${tutor.last_name}`,
    tutorEmail:  tutor.email ?? '',
    subjects:    tutor.subjects ?? [],
    hourlyRate:  tutor.hourly_rate ?? tutor.hourly_rate,
    rating:      tutor.rating,
    distanceKm:  tutor.distance_km,
    score:       tutor._score,
    subject,
    matchedAt:   new Date().toISOString(),
  }
}

/** Mock tutor pool — used when the API is offline */
export function getMockTutors(center = [6.5244, 3.3792]) {
  const offsets = [[0.008, 0.005], [-0.004, 0.010], [0.012, -0.007], [-0.010, 0.003], [0.006, 0.015], [0.003, -0.008]]
  const data = [
    { first_name: 'Kolade',  last_name: 'Okonkwo',  subjects: ['Mathematics', 'Further Maths', 'Physics'],  hourly_rate: 3500, rating: 4.9, is_available: true,  verification_status: 'APPROVED', total_reviews: 47, completion_rate: 98 },
    { first_name: 'Fatima',  last_name: 'Bello',    subjects: ['Chemistry', 'Biology'],                     hourly_rate: 3000, rating: 4.7, is_available: true,  verification_status: 'APPROVED', total_reviews: 30, completion_rate: 95 },
    { first_name: 'Chidi',   last_name: 'Abiodun',  subjects: ['English', 'Literature', 'Government'],      hourly_rate: 2800, rating: 4.5, is_available: true,  verification_status: 'APPROVED', total_reviews: 22, completion_rate: 90 },
    { first_name: 'Tunde',   last_name: 'Nwosu',    subjects: ['Economics', 'Commerce', 'Mathematics'],     hourly_rate: 2500, rating: 4.2, is_available: true,  verification_status: 'APPROVED', total_reviews: 18, completion_rate: 88 },
    { first_name: 'Zainab',  last_name: 'Ibrahim',  subjects: ['Coding', 'Design', 'Further Maths'],        hourly_rate: 5000, rating: 4.8, is_available: true,  verification_status: 'APPROVED', total_reviews: 35, completion_rate: 97 },
    { first_name: 'Amaka',   last_name: 'Eze',      subjects: ['Chemistry', 'Biology', 'Physics'],          hourly_rate: 3200, rating: 4.6, is_available: true,  verification_status: 'APPROVED', total_reviews: 28, completion_rate: 93 },
  ]
  return offsets.map(([dlat, dlng], i) => ({
    id:          `mock-tutor-${i}`,
    email:       `mock${i}@dev.local`,
    ...data[i],
    latitude:    center[0] + dlat,
    longitude:   center[1] + dlng,
    distance_km: parseFloat(Math.abs(dlat * 111).toFixed(1)),
  }))
}
