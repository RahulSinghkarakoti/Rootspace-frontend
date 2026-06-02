import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import SettingSidebar from './SettingSidebar'
import { Button } from '@/components/ui/button'

const SettingsLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const handleResize = (event: MediaQueryListEvent | MediaQueryList) => setIsMobile(event.matches)

    handleResize(media)
    media.addEventListener('change', handleResize)

    return () => media.removeEventListener('change', handleResize)
  }, [])

  const isIndexRoute = location.pathname === '/dashboard/settings' || location.pathname === '/dashboard/settings/'
  const showSidebar = !isMobile || isIndexRoute
  const showContent = !isMobile || !isIndexRoute

  return (
    <div className={cn('min-h-dvh bg-background', showSidebar && 'lg:flex')}>
      {showSidebar && <SettingSidebar />}

      {showContent && (
        <main className="flex-1 sidebar-transition">
          <div className="container-fluid max-w-[1600px] mx-auto animate-fade-in">
            {isMobile && !isIndexRoute && (
              <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/settings')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <p className="text-sm font-medium text-foreground">Back to settings</p>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      )}
    </div>
  )
}

export default SettingsLayout
