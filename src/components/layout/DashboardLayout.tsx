import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const { sidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />

      {/* Main content area */}
      <main
        className={cn(
          'min-h-screen pt-14 sidebar-transition',
          'pl-0 lg:pl-[260px]',
          sidebarCollapsed && 'lg:pl-[68px]'
        )}
      >
        <div className="container-fluid p-4 max-w-[1600px] mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
