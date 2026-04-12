/**
 * matchingStore — transient state for an active tutor-match request.
 *
 * NOT persisted — cleared on every new request and on page unload.
 * This exists so that the FindTutor page and any listening components
 * (e.g. BottomNav badge) can read the same state without prop-drilling.
 */
import { create } from 'zustand'

export const MATCH_STATUS = {
  IDLE:       'idle',
  SEARCHING:  'searching',   // dispatching to candidates
  FOUND:      'found',       // a tutor accepted
  TIMEOUT:    'timeout',     // 60s elapsed, nobody accepted
  CANCELLED:  'cancelled',   // user cancelled
}

export const useMatchingStore = create((set) => ({
  status:          MATCH_STATUS.IDLE,
  subject:         '',
  candidates:      [],          // tutors being contacted (shown in UI)
  notifiedCount:   0,           // how many have been "notified" so far
  matchedTutor:    null,        // the tutor who accepted
  secondsLeft:     60,
  timerHandle:     null,

  startSearch: ({ subject, candidates }) =>
    set({
      status:        MATCH_STATUS.SEARCHING,
      subject,
      candidates,
      notifiedCount: 0,
      matchedTutor:  null,
      secondsLeft:   60,
    }),

  incrementNotified: () =>
    set(s => ({ notifiedCount: s.notifiedCount + 1 })),

  tickTimer: () =>
    set(s => ({ secondsLeft: Math.max(0, s.secondsLeft - 1) })),

  setTimerHandle: (handle) => set({ timerHandle: handle }),

  found: (tutor) =>
    set({ status: MATCH_STATUS.FOUND, matchedTutor: tutor }),

  timeout: () =>
    set({ status: MATCH_STATUS.TIMEOUT }),

  cancel: () =>
    set({ status: MATCH_STATUS.CANCELLED, candidates: [], matchedTutor: null }),

  reset: () =>
    set({
      status:        MATCH_STATUS.IDLE,
      subject:       '',
      candidates:    [],
      notifiedCount: 0,
      matchedTutor:  null,
      secondsLeft:   60,
      timerHandle:   null,
    }),
}))
