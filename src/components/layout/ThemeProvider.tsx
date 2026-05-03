import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <>{children}</>
}
