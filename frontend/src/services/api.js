import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — log out and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

/* ── Auth ──────────────────────────────────── */
export const authAPI = {
  register:       (data)     => api.post('/api/auth/register/', data),
  login:          (data)     => api.post('/api/auth/login/', data),
  refresh:        (refresh)  => api.post('/api/auth/token/refresh/', { refresh }),
  me:             ()         => api.get('/api/auth/me/'),
  changePassword: (data)     => api.post('/api/auth/change-password/', data),
}

/* ── Users / Profiles ──────────────────────── */
export const usersAPI = {
  updateProfile:     (data)   => api.patch('/api/users/me/', data),
  getTutors:         (params) => api.get('/api/users/tutors/', { params }),
  getTutorById:      (id)     => api.get(`/api/users/tutors/${id}/`),
  getNearbyTutors:   (params) => api.get('/api/users/tutors/nearby/', { params }),
  getPaymentMethods: ()       => api.get('/api/users/payment-methods/'),
  savePaymentMethod: (data)   => api.post('/api/users/payment-methods/', data),
  removePaymentMethod:(id)    => api.delete(`/api/users/payment-methods/${id}/`),
  getBankAccount:    ()       => api.get('/api/users/bank-account/'),
  saveBankAccount:   (data)   => api.post('/api/users/bank-account/', data),
}

/* ── Sessions ──────────────────────────────── */
export const sessionsAPI = {
  create:          (data) => api.post('/api/sessions/', data),
  list:            ()     => api.get('/api/sessions/'),
  getById:         (id)   => api.get(`/api/sessions/${id}/`),
  accept:          (id)   => api.post(`/api/sessions/${id}/accept/`),
  reject:          (id)   => api.post(`/api/sessions/${id}/reject/`),
  complete:        (id)   => api.post(`/api/sessions/${id}/complete/`),
  cancel:          (id, reason) => api.post(`/api/sessions/${id}/cancel/`, { reason }),
  confirm:         (id)   => api.post(`/api/sessions/${id}/confirm/`),
  raiseDispute:    (id, data) => api.post(`/api/sessions/${id}/dispute/`, data),
}

/* ── Payments ──────────────────────────────── */
export const paymentsAPI = {
  initiate:       (data) => api.post('/api/payments/initiate/', data),
  verify:         (ref)  => api.get(`/api/payments/verify/${ref}/`),
  getHistory:     ()     => api.get('/api/payments/'),
}

/* ── Payouts ───────────────────────────────── */
export const payoutsAPI = {
  list:           ()     => api.get('/api/payouts/'),
  getEarnings:    ()     => api.get('/api/payouts/earnings/'),
}

/* ── Reviews ───────────────────────────────── */
export const reviewsAPI = {
  submit: (sessionId, data) => api.post('/api/reviews/', { session: sessionId, ...data }),
  list:   (tutorId)         => api.get('/api/reviews/', { params: { tutor: tutorId } }),
}
