import { useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, TreePine } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface GoogleAuthPayload {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string | null
    role?: string
    isVerified?: boolean
  }
  accessToken: string
  expiresAt: number
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  return atob(`${base64}${padding}`)
}

const GOOGLE_REDIRECT_STORAGE_KEY = 'rootspace-auth-redirect'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const payload = searchParams.get('payload')

  useEffect(() => {
    if (!payload) return

    try {
      const decoded = JSON.parse(decodeBase64Url(payload)) as GoogleAuthPayload
      const user = {
        ...decoded.user,
        avatarUrl: decoded.user.avatarUrl ?? undefined,
      }

      login(user, {
        accessToken: decoded.accessToken,
        expiresAt: decoded.expiresAt,
      })

      const redirectTo = localStorage.getItem(GOOGLE_REDIRECT_STORAGE_KEY) ?? '/dashboard'
      localStorage.removeItem(GOOGLE_REDIRECT_STORAGE_KEY)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      console.error('Google sign-in callback failed', error)
      navigate('/login?error=google_auth_failed', { replace: true })
    }
  }, [login, navigate, payload])

  if (!payload) {
    return <Navigate to="/login?error=google_auth_failed" replace />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/30">
          <TreePine className="h-6 w-6 text-amber-950" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Finishing sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Taking you to your family trees...</p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
      </div>
    </div>
  )
}
