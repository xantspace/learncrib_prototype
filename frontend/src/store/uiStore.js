import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set, get) => ({
      toast: null,
      darkMode: false,
      notificationPrefs: {
        sessionReminders: true,
        paymentAlerts:    true,
        newMessages:      true,
        promotions:       false,
      },

      showToast: (message, type = 'info', duration = 3500) =>
        set({ toast: { message, type, duration } }),

      clearToast: () => set({ toast: null }),

      toggleDarkMode: () => {
        const next = !get().darkMode
        set({ darkMode: next })
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setNotificationPref: (key, value) =>
        set(s => ({
          notificationPrefs: { ...s.notificationPrefs, [key]: value },
        })),
    }),
    {
      name: 'lc-ui',
      partialize: (s) => ({
        darkMode:          s.darkMode,
        notificationPrefs: s.notificationPrefs,
      }),
    }
  )
)
