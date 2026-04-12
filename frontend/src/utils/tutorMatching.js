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

  // Step 2 — rank (verifiedOnly=true since backend only returns APPROVED tutors)
  const ranked = rankTutors(eligible, {
    studentLat,
    studentLng,
    verifiedOnly: true,
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

/**
 * Fallback: Generate mock tutors near the student's location.
 */
export function getMockTutors([lat, lng] = [6.5244, 3.3792]) {
  return [
    {
      id: 'm1',
      first_name: 'Damilola',
      last_name: 'Adeyemi',
      email: 'tutor1@example.com',
      subjects: ['Mathematics', 'Further Maths', 'Physics', 'Coding'],
      hourly_rate: 5500,
      rating: '4.8',
      total_reviews: 42,
      is_available: true,
      verification_status: 'APPROVED',
      latitude: lat + 0.0123,
      longitude: lng - 0.0045,
    },
    {
      id: 'm2',
      first_name: 'Chinyere',
      last_name: 'Okonkwo',
      email: 'tutor2@example.com',
      subjects: ['English', 'Literature', 'History', 'Government'],
      hourly_rate: 4200,
      rating: '4.9',
      total_reviews: 28,
      is_available: true,
      verification_status: 'APPROVED',
      latitude: lat - 0.0089,
      longitude: lng + 0.0156,
    },
    {
      id: 'm3',
      first_name: 'Tunde',
      last_name: 'Bakare',
      email: 'tutor3@example.com',
      subjects: ['Chemistry', 'Biology', 'Physics'],
      hourly_rate: 4800,
      rating: '4.5',
      total_reviews: 15,
      is_available: true,
      verification_status: 'APPROVED',
      latitude: lat + 0.0055,
      longitude: lng + 0.0221,
    },
    {
      id: 'm4',
      first_name: 'Amaka',
      last_name: 'Eze',
      email: 'tutor4@example.com',
      subjects: ['Economics', 'Commerce', 'Accountancy'],
      hourly_rate: 3500,
      rating: '4.7',
      total_reviews: 31,
      is_available: true,
      verification_status: 'APPROVED',
      latitude: lat - 0.0152,
      longitude: lng - 0.0118,
    },
    {
      id: 'm5',
      first_name: 'Seyi',
      last_name: 'Makinde',
      email: 'tutor5@example.com',
      subjects: ['Design', 'Coding', 'Mathematics'],
      hourly_rate: 6000,
      rating: '5.0',
      total_reviews: 8,
      is_available: true,
      verification_status: 'APPROVED',
      latitude: lat + 0.0189,
      longitude: lng - 0.0203,
    }
  ]
}

