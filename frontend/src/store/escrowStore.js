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
 * Records are written when a payment is initiated and updated as admin
 * takes action (release/refund/dispute). All views read from here.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PLATFORM_FEE_RATE = 0.10

let refCounter = 0

export const useEscrowStore = create(
  persist(
    (set, get) => ({
      records: {},

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
