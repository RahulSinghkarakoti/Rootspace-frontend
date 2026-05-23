import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TreePine, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { useAppStore } from '@/store/appStore'
import { Sun, Moon } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@rootspace.app')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, signInWithGoogle, isLoading } = useAuth()
  const { toggleTheme, theme } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={signInWithGoogle}
                disabled={isLoading}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                  G
                </span>
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-amber-500 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              <Link to="/register" className="text-amber-500 font-medium hover:underline">
                Create one free
              </Link>
            </p>

            <div className="mt-8 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Demo credentials</p>
              <p className="text-xs text-muted-foreground">Email: demo@rootspace.app</p>
              <p className="text-xs text-muted-foreground">Password: password123</p>
            </div>
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
