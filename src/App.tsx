import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { ToastProvider } from '@/components/ui/toast'
import { useAuthStore } from '@/store/authStore'

// Primary auth pages (loaded immediately for snappy login)
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import GoogleCallbackPage from '@/pages/GoogleCallbackPage'

// Lazy-loaded pages to prevent monolithic bundle
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const TreeEditorPage = lazy(() => import('@/pages/dashboard/TreeEditorPage'))
const TreesPage = lazy(() => import('@/pages/dashboard/TreesPage'))
const SharedTreesPage = lazy(() => import('@/pages/dashboard/SharedTreesPage'))
const CollaboratorsPage = lazy(() => import('@/pages/dashboard/CollaboratorsPage'))
const SharedTreeAccessPage = lazy(() => import('@/pages/dashboard/SharedTreeAccessPage'))
const SettingsLayout = lazy(() => import('@/components/layout/SettingsLayout'))
const SettingsProfilePage = lazy(() => import('@/pages/dashboard/SettingsProfilePage'))
const SettingsAppsSessionsPage = lazy(() => import('@/pages/dashboard/SettingsAppsSessionsPage'))
const SettingsPrivacySafetyPage = lazy(() => import('@/pages/dashboard/SettingsPrivacySafetyPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function RootRedirect() {
  const { isAuthenticated } = useAuthStore()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function PageFallback() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Root route redirects to dashboard if logged in, or login if not */}
                <Route path="/" element={<RootRedirect />} />

                {/* Authentication routes */}
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

                {/* Public policy / legal routes */}
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/tnc" element={<TermsPage />} />
                <Route path="/terms" element={<Navigate to="/tnc" replace />} />
                <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />

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
                  <Route path="search" element={<Navigate to="/dashboard" replace />} />
                  <Route path="collaborators" element={<CollaboratorsPage />} />
                  <Route path="shared" element={<SharedTreeAccessPage />} />

                  <Route path="settings" element={<SettingsLayout />}>
                    <Route index element={<SettingsProfilePage />} />
                    <Route path="profile" element={<SettingsProfilePage />} />
                    <Route path="apps-and-sessions" element={<SettingsAppsSessionsPage />} />
                    <Route path="privacy-and-safety" element={<SettingsPrivacySafetyPage />} />
                    <Route path="premium" element={<Navigate to="/dashboard/settings/profile" replace />} />
                    <Route path="theme" element={<Navigate to="/dashboard/settings/profile" replace />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
