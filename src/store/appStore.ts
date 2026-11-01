import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { DashboardData } from '@/types/dashboard.types'

interface AppStore {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  sidebarCollapsed: boolean

  // Dashboard cache
  dashboard: DashboardData | null
  dashboardFetchedAt: number | null
  setDashboard: (data: DashboardData) => void
  clearDashboard: () => void

  // Actions
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,

      // Dashboard cache
      dashboard: null,
      dashboardFetchedAt: null,
      setDashboard: (data: DashboardData) => set({ dashboard: data, dashboardFetchedAt: Date.now() }),
      clearDashboard: () => set({ dashboard: null, dashboardFetchedAt: null }),

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark'
          // Apply to DOM
          document.documentElement.classList.toggle('dark', newTheme === 'dark')
          return { theme: newTheme }
        }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
    }),
    {
      name: 'rootspace-app',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
