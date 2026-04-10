import { create } from 'zustand'

export const useUIStore = create((set) => ({
  toast: null,

  showToast: (message, type = 'info', duration = 3500) =>
    set({ toast: { message, type, duration } }),

  clearToast: () => set({ toast: null }),
}))
