/**
 * verificationStore — shared source of truth for tutor verification status.
 *
 * Why this exists: admin and tutor views live in the same browser session
 * during dev/demo. This store acts as the in-memory backend for verification
 * state so that admin approval instantly reflects on the tutor dashboard.
 * In production this state would come from real API calls, but the store
 * pattern keeps the plumbing identical — just swap the seeded data for
 * API responses.
 *
 * Keyed by tutor email for cross-component lookup consistency.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Seed: mirrors the pending entries in admin/Tutors.jsx MOCK_TUTORS
const SEED = {
  'adaeze@mail.com': {
    email:       'adaeze@mail.com',
    name:        'Adaeze Nnoli',
    status:      'PENDING',
    submittedAt: '2025-04-09',
    idType:      'National ID (NIN)',
    edu:         'B.A English',
    subjects:    ['English', 'Literature'],
    selfie:      true,
    rejectionReason: null,
  },
  'ngozi@mail.com': {
    email:       'ngozi@mail.com',
    name:        'Ngozi Adeleke',
    status:      'PENDING',
    submittedAt: '2025-04-11',
    idType:      'International Passport',
    edu:         'B.Sc Computer Science',
    subjects:    ['Coding', 'Design'],
    selfie:      true,
    rejectionReason: null,
  },
}

export const useVerificationStore = create(
  persist(
    (set, get) => ({
      records: SEED,   // { [email]: VerificationRecord }

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
