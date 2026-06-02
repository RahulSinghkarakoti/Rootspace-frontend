import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/authApi'
import type { User, AuthTokens } from '@/types'

const GOOGLE_REDIRECT_STORAGE_KEY = 'rootspace-auth-redirect'

const saveGoogleRedirect = (redirectTo: string) => {
  try {
    localStorage.setItem(GOOGLE_REDIRECT_STORAGE_KEY, redirectTo)
  } catch {
    // ignore storage failures
  }
}

export function useAuth() {
  const { user, tokens, isAuthenticated, isLoading, login, logout, setLoading ,setSessionInfo} =
    useAuthStore()
  const navigate = useNavigate()

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      try {
        const { data } = await authApi.login(email, password)
        const { user, tokens } = data.data
        login(user, tokens)
      } catch (err) {
        console.error('Login failed', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [login, setLoading]
  )

  // Extract parseName outside useCallback (don't recreate on every call)
  const parseName = useCallback((name: string): [string, string] => {
    if (!name?.trim()) return ['', ''];

    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length === 1
      ? ['', parts[0]]
      : [parts[0], parts.slice(1).join(' ')];
  }, []);

  const handleRegister = useCallback(
    async (name: string, email: string, password: string) => {
      setLoading(true);

      try {
        const [firstName, lastName] = parseName(name);
        const { data } = await authApi.register(firstName, lastName, email, password);
        const { user, tokens } = data.data;

        login({ ...user, name }, tokens);
      } catch (error) {
        console.error('Registration failed:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [login, parseName, setLoading]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (_) { }
    logout()
    navigate('/login')
  }, [logout, navigate])

  const getProfile = useCallback(async () => {
    try {
      const { data } = await authApi.me()
      console.log(data)
      return data
    } catch (error) {
      console.error('Profile error:', error)
      throw error
    }
  }, [navigate])

  const getSessionInfo = useCallback(async () => {
    try {
      const { data } = await authApi.sessionInfo() 
      setSessionInfo(data.data)
      return data
    } catch (error) {
      console.error('Session info error:', error)
      throw error
    }
  }, [navigate])

  const handleGoogleAuth = useCallback((redirectTo = '/dashboard') => {
    saveGoogleRedirect(redirectTo)
    window.location.assign(authApi.googleAuthUrl)
  }, [])

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    signInWithGoogle: handleGoogleAuth,
    logout: handleLogout,
    getProfile,
    getSessionInfo,
  }
}
