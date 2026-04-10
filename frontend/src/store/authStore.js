import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,  // { id, email, first_name, last_name, role, phone }
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,

      setAuth: ({ user, access, refresh }) =>
        set({ user, accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),

      isAuthenticated: () => !!get().accessToken,

      isStudent: () => get().user?.role === 'STUDENT',
      isTutor:   () => get().user?.role === 'TUTOR',
      isAdmin:   () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'lc-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
