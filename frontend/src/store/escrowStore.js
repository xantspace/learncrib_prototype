/**
 * escrowStore — single source of truth for all payment / escrow records.
 *
 * Status machine:
 *   PENDING → ESCROW (payment captured) → IN_SESSION (session started)
 *          → COMPLETED (session done, 48h hold)
 *          → RELEASED (funds sent to tutor)
 *          → DISPUTED (frozen, under review)
 *          → REFUNDED (returned to student)
 *
 * In production: API responses populate this store.
 * In dev / offline: local actions write here and all views read from here.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PLATFORM_FEE_RATE = 0.10

// Seed records so admin always has something to view
const SEED = {
  'session-S001': {
    sessionId:    'session-S001',
    paymentRef:   'PAY-001',
    studentName:  'Temi Adeyemi',
    tutorName:    'Kolade Okonkwo',
    tutorEmail:   'kolade@mail.com',
    subject:      'Mathematics',
    sessionAmount: 3500,
    platformFee:   350,
    total:         3850,
    status:        'ESCROW',
    createdAt:     '2025-04-10T09:00:00.000Z',
    scheduledAt:   '2025-04-14T10:00:00.000Z',
    completedAt:   null,
    releasedAt:    null,
  },
  'session-S002': {
    sessionId:    'session-S002',
    paymentRef:   'PAY-002',
    studentName:  'Fatima Musa',
    tutorName:    'Amaka Eze',
    tutorEmail:   'amaka@mail.com',
    subject:      'Chemistry',
    sessionAmount: 3000,
    platformFee:   300,
    total:         3300,
    status:        'ESCROW',
    createdAt:     '2025-04-10T11:00:00.000Z',
    scheduledAt:   '2025-04-15T14:00:00.000Z',
    completedAt:   null,
    releasedAt:    null,
  },
  'session-S003': {
    sessionId:    'session-S003',
    paymentRef:   'PAY-003',
    studentName:  'Emeka Okafor',
    tutorName:    'Kolade Okonkwo',
    tutorEmail:   'kolade@mail.com',
    subject:      'Physics',
    sessionAmount: 3500,
    platformFee:   350,
    total:         3850,
    status:        'RELEASED',
    createdAt:     '2025-04-09T08:00:00.000Z',
    scheduledAt:   '2025-04-09T10:00:00.000Z',
    completedAt:   '2025-04-09T11:00:00.000Z',
    releasedAt:    '2025-04-11T08:00:00.000Z',
  },
  'session-S004': {
    sessionId:    'session-S004',
    paymentRef:   'PAY-004',
    studentName:  'Chidi Obi',
    tutorName:    'Amaka Eze',
    tutorEmail:   'amaka@mail.com',
    subject:      'Biology',
    sessionAmount: 3000,
    platformFee:   300,
    total:         3300,
    status:        'PENDING',
    createdAt:     '2025-04-11T07:00:00.000Z',
    scheduledAt:   '2025-04-16T10:00:00.000Z',
    completedAt:   null,
    releasedAt:    null,
  },
  'session-S005': {
    sessionId:    'session-S005',
    paymentRef:   'PAY-005',
    studentName:  'Grace Nwosu',
    tutorName:    'Babatunde Osei',
    tutorEmail:   'baba@mail.com',
    subject:      'Physics',
    sessionAmount: 4000,
    platformFee:   400,
    total:         4400,
    status:        'RELEASED',
    createdAt:     '2025-04-08T09:00:00.000Z',
    scheduledAt:   '2025-04-08T11:00:00.000Z',
    completedAt:   '2025-04-08T12:00:00.000Z',
    releasedAt:    '2025-04-10T09:00:00.000Z',
  },
  'session-S006': {
    sessionId:    'session-S006',
    paymentRef:   'PAY-006',
    studentName:  'Tunde Bello',
    tutorName:    'Ngozi Adeleke',
    tutorEmail:   'ngozi@mail.com',
    subject:      'Coding',
    sessionAmount: 5000,
    platformFee:   500,
    total:         5500,
    status:        'REFUNDED',
    createdAt:     '2025-04-07T10:00:00.000Z',
    scheduledAt:   '2025-04-07T14:00:00.000Z',
    completedAt:   null,
    releasedAt:    null,
  },
}

let refCounter = 7  // for generating PAY-XXX references

export const useEscrowStore = create(
  persist(
    (set, get) => ({
      records: SEED,

      /**
       * Called when a student pays. Creates ESCROW record.
       */
      createPayment: ({ sessionId, studentName, tutorName, tutorEmail, subject, sessionAmount, scheduledAt }) => {
        refCounter++
        const ref = `PAY-${String(refCounter).padStart(3, '0')}`
        const platformFee = Math.round(sessionAmount * PLATFORM_FEE_RATE)
        const record = {
          sessionId,
          paymentRef:   ref,
          studentName,
          tutorName,
          tutorEmail,
          subject,
          sessionAmount,
          platformFee,
          total: sessionAmount + platformFee,
          status: 'ESCROW',
          createdAt:   new Date().toISOString(),
          scheduledAt: scheduledAt ?? null,
          completedAt: null,
          releasedAt:  null,
        }
        set(s => ({ records: { ...s.records, [sessionId]: record } }))
        return record
      },

      /** Transition a record to a new status */
      setStatus: (sessionId, status, extra = {}) =>
        set(s => ({
          records: {
            ...s.records,
            [sessionId]: {
              ...s.records[sessionId],
              status,
              ...extra,
            },
          },
        })),

      /** Admin: release escrow to tutor */
      release: (sessionId) => {
        set(s => ({
          records: {
            ...s.records,
            [sessionId]: {
              ...s.records[sessionId],
              status: 'RELEASED',
              releasedAt: new Date().toISOString(),
            },
          },
        }))
      },

      /** Admin: refund to student */
      refund: (sessionId) => {
        set(s => ({
          records: {
            ...s.records,
            [sessionId]: {
              ...s.records[sessionId],
              status: 'REFUNDED',
            },
          },
        }))
      },

      /** Admin: freeze (dispute) */
      dispute: (sessionId) => {
        set(s => ({
          records: {
            ...s.records,
            [sessionId]: {
              ...s.records[sessionId],
              status: 'DISPUTED',
            },
          },
        }))
      },

      getBySessionId: (sessionId) => get().records[sessionId] ?? null,

      all: () => Object.values(get().records)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),

      /** Totals for dashboard summary cards */
      totals: () => {
        const all = Object.values(get().records)
        return {
          escrowAmount:   all.filter(r => r.status === 'ESCROW').reduce((s, r) => s + r.total, 0),
          releasedAmount: all.filter(r => r.status === 'RELEASED').reduce((s, r) => s + r.total, 0),
          pendingCount:   all.filter(r => r.status === 'PENDING').length,
          escrowCount:    all.filter(r => r.status === 'ESCROW').length,
          releasedCount:  all.filter(r => r.status === 'RELEASED').length,
          refundedCount:  all.filter(r => r.status === 'REFUNDED').length,
          disputedCount:  all.filter(r => r.status === 'DISPUTED').length,
        }
      },
    }),
    { name: 'lc-escrow' }
  )
)

/** Status display config — used by all views */
export const ESCROW_STATUS = {
  PENDING:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', desc: 'Awaiting student payment' },
  ESCROW:     { label: 'In Escrow',  color: 'bg-blue-100 text-blue-700',    desc: 'Funds secured — awaiting completion' },
  IN_SESSION: { label: 'In Session', color: 'bg-purple-100 text-purple-700', desc: 'Session in progress' },
  COMPLETED:  { label: 'Completed',  color: 'bg-teal-100 text-teal-700',    desc: 'Pending 48h release window' },
  RELEASED:   { label: 'Released',   color: 'bg-green-100 text-green-700',  desc: 'Paid out to tutor' },
  DISPUTED:   { label: 'Disputed',   color: 'bg-red-100 text-red-500',      desc: 'Funds frozen — under review' },
  REFUNDED:   { label: 'Refunded',   color: 'bg-gray-100 text-gray-500',    desc: 'Returned to student' },
}
