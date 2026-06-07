import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TreePine, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/appStore'
import { Sun, Moon } from 'lucide-react'
import ForgotPassswordDialog from '@/components/dialogs/ForgetPasswordDialog/ForgotPassswordDialog'
import { useForm } from 'react-hook-form'
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, signInWithGoogle, isLoading } = useAuth()
  const { toggleTheme, theme } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string; search?: string } })?.from
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard'
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<{ email: string; password: string }>({
    defaultValues: { email: 'demo@rootspace.app', password: '4!Ed98j9w5Laq@e' }, mode: "onChange",
  })
  const onLogin = async (data: { email: string; password: string }) => {
    setError('')
    try {

      await login(data.email, data.password)
      navigate(redirectTo, { replace: true })
    } catch {
      setError('Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/30">
              <TreePine className="h-4 w-4 text-amber-950" />
            </div>
            <span className="font-display text-xl font-bold">
              Root<span className="text-amber-500">Space</span>
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Form content */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm">
                Sign in to continue exploring your family legacy
              </p>
            </div>

            <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 font-medium"
                onClick={() => signInWithGoogle(redirectTo)}
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="you@example.com"
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <ForgotPassswordDialog>

                    <a href="#" className="text-xs text-amber-500 hover:underline">
                      Forgot password?
                    </a>
                  </ForgotPassswordDialog>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="gold"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" state={location.state} className="text-amber-500 font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Decorative panel (desktop only) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-stone-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-amber-600 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center justify-center w-full p-12 text-center">
          <TreePine className="h-20 w-20 text-amber-400 mb-8 opacity-80" />
          <h2 className="font-display text-4xl font-bold text-amber-50 mb-4 leading-tight">
            Every branch tells<br />a story
          </h2>
          <p className="text-amber-200/70 text-base max-w-xs leading-relaxed">
            Discover the people, places, and moments that shaped who you are today.
          </p>
          <div className="mt-10 flex gap-3 flex-wrap justify-center">
            {['Genealogy', 'Heritage', 'DNA Matching', 'Sharing', 'History'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
