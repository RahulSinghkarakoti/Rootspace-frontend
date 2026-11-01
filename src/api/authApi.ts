
import { api } from './axios'
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const GOOGLE_AUTH_URL = `${BASE_URL}/auth/google`

// ─── Auth API helpers ────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>{
    return api.post('/auth/login', { email, password })},

  register: (firstName: string, lastName: string, email: string, password: string) =>
    api.post('/auth/register', { firstName, lastName, email, password }),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  logout: () => api.post('/auth/logout'),

  sessionInfo: () => api.get('/auth/sessions'),

  me: () => api.get('/auth/me'),

  changePassword: ( newPassword: string, token?: string) =>
    api.post('/auth/change-password', {  newPassword, token }),

  sendVerificationOtp: (email: string) =>
    api.post('/auth/send-verification-otp', { email }),

  revokeSession: (sessionId: number) =>
    api.post('/auth/revoke-session/' + sessionId),

  sendPasswordResetEmail: (email: string) =>
    api.post('/auth/send-password-reset-email', { email }),

  googleAuthUrl: GOOGLE_AUTH_URL,
}
