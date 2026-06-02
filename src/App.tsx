import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { ToastProvider } from '@/components/ui/toast'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import GoogleCallbackPage from '@/pages/GoogleCallbackPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import TreeEditorPage from '@/pages/dashboard/TreeEditorPage'
import {
  TreesPage,
  AncestralSearchPage,
  SharedTreesPage,
  CollaboratorsPage,
  SettingsPage,
  SettingsProfilePage,
  SettingsAppsSessionsPage,
  SettingsPrivacySafetyPage,
  SettingsPremiumPage,
  SettingsThemePage,
} from '@/pages/dashboard'
import SettingsLayout from './components/layout/SettingsLayout'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SharedTreeAccessPage from './pages/dashboard/SharedTreeAccessPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />

              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                path="/shared"
                element={
                  <ProtectedRoute>
                    <SharedTreesPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >


                <Route index element={<DashboardPage />} />
                <Route path="trees" element={<TreesPage />} />
                <Route path="editor" element={<TreeEditorPage />} />
                <Route path="search" element={<AncestralSearchPage />} />
                <Route path="collaborators" element={<CollaboratorsPage />} />
                <Route path="shared" element={<SharedTreeAccessPage />} />

                <Route path="settings" element={<SettingsLayout />}>
                  <Route index element={<SettingsPage />} />
                  <Route path="profile" element={<SettingsProfilePage />} />
                  <Route path="apps-and-sessions" element={<SettingsAppsSessionsPage />} />
                  <Route path="privacy-and-safety" element={<SettingsPrivacySafetyPage />} />
                  <Route path="premium" element={<SettingsPremiumPage />} />
                  <Route path="theme" element={<SettingsThemePage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
