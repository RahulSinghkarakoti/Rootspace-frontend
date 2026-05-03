import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens } from '@/types'

interface AuthStore {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  login: (user: User, tokens: AuthTokens) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateAccessToken: (accessToken: string, expiresAt: number) => void
  isTokenExpired: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user }),

      setTokens: (tokens) => set({ tokens }),

      login: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      updateAccessToken: (accessToken, expiresAt) =>
        set((state) => ({
          tokens: state.tokens
            ? { ...state.tokens, accessToken, expiresAt }
            : null,
        })),

      isTokenExpired: () => {
        const { tokens } = get()
        if (!tokens) return true
        // Expire 30 seconds before actual expiry for safety
        return Date.now() >= tokens.expiresAt - 30_000
      },
    }),
    {
      name: 'rootspace-auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist tokens and user, not loading state
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
