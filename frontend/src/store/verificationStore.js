/**
 * verificationStore — shared source of truth for tutor verification status.
 *
 * Bridges tutor verification submissions and admin approval actions in the
 * same browser session. Keyed by tutor email for cross-component lookup.
 *
 * Admin views read from here; tutor dashboard syncs status back to authStore
 * when a record changes.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVerificationStore = create(
  persist(
    (set, get) => ({
      records: {},   // { [email]: VerificationRecord }

      /** Tutor calls this when they complete the 5-step form */
      submit: (email, data) =>
        set(s => ({
          records: {
            ...s.records,
            [email]: {
              ...data,
              email,
              status:      'PENDING',
              submittedAt: new Date().toISOString(),
              rejectionReason: null,
            },
          },
        })),

      /** Admin: approve a tutor */
      approve: (email) =>
        set(s => ({
          records: {
            ...s.records,
            [email]: { ...s.records[email], status: 'APPROVED', rejectionReason: null },
          },
        })),

      /** Admin: reject a tutor with a reason */
      reject: (email, reason) =>
        set(s => ({
          records: {
            ...s.records,
            [email]: { ...s.records[email], status: 'REJECTED', rejectionReason: reason },
          },
        })),

      /** Look up a record by email */
      getRecord: (email) => get().records[email] ?? null,

      /** All records as an array */
      all: () => Object.values(get().records),

      /** Pending records sorted newest first */
      pending: () =>
        Object.values(get().records)
          .filter(r => r.status === 'PENDING')
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    }),
    { name: 'lc-verification' }
  )
)
