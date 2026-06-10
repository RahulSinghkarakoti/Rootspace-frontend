import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GitBranch,
  Search,
  Share2,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  TreePine,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function Sidebar() {
  const { t } = useTranslation()
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapsed, setSidebarOpen } = useAppStore()

  const navItems = [
    {
      group: t('sidebar.main'),
      items: [
        { label: t('sidebar.dashboard'), icon: LayoutDashboard, href: '/dashboard' },
        { label: t('sidebar.myTrees'), icon: GitBranch, href: '/dashboard/trees' },
      ],
    },
    {
      group: t('sidebar.discover'),
      items: [
        // { label: t('sidebar.ancestralSearch'), icon: Search, href: '/dashboard/search', badge: 'New' },
        { label: t('sidebar.sharedTrees'), icon: Share2, href: '/dashboard/shared' },
        { label: t('sidebar.collaborators'), icon: Users, href: '/dashboard/collaborators' },
      ],
    },
    {
      group: t('sidebar.account'),
      items: [
        { label: t('sidebar.settings'), icon: Settings, href: '/dashboard/settings' },
        // { label: t('sidebar.helpSupport'), icon: HelpCircle, href: '/dashboard/help' },
      ],
    },
  ]

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-card sidebar-transition',
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className={cn('flex items-center gap-2 px-3 py-3', sidebarCollapsed && 'justify-center px-2')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/30">
            <TreePine className="h-4 w-4 text-amber-950" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight text-foreground">
                Root<span className="text-amber-500">Space</span>
              </span>
              <span className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground">
                Family Legacy
              </span>
            </div>
          )}
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-2 py-2">
          {navItems.map((group) => (
            <div key={group.group} className="mb-3">
              {!sidebarCollapsed && (
                <p className="mb-1 px-2 text-[7px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/dashboard'}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-all duration-150',
                        sidebarCollapsed && 'justify-center px-1.5',
                        isActive
                          ? 'bg-amber-500/15 text-amber-500'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-amber-500' : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {/* {item?.badge && (
                              <Badge variant="gold" className="text-[7px] px-1 py-0">
                                {item?.badge}
                              </Badge>
                            )} */}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        <Separator />

        <div className="hidden lg:flex justify-end p-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleSidebarCollapsed}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform duration-300', sidebarCollapsed && 'rotate-180')}
            />
          </Button>
        </div>
      </aside>
    </>
  )
}
