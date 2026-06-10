import React from 'react'
import { cn } from '@/lib/utils'
import { NavLink } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

const SettingSidebar = () => {
  const settingItems = [
    { name: 'Your Profile', path: '/dashboard/settings/profile' },
    { name: 'Apps And Sessions', path: '/dashboard/settings/apps-and-sessions' },
    // { name: 'Manage Theme', path: '/dashboard/settings/theme' },
    // { name: 'Premium', path: '/dashboard/settings/premium' },
    { name: 'Privacy And Safety', path: '/dashboard/settings/privacy-and-safety' },
  ]

  return (
    <aside className={cn(
      'flex h-full min-h-dvh flex-col border-r border-border bg-card sidebar-transition',
      'w-full lg:w-[260px] oveflow-hidden lg:overflow-y-auto'
    )}>
      <div className="px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto ">
        <div className="space-y-1">
          {settingItems.map((item, index) => (
            <div key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'block   py-2 px-2 text-xs font-medium transition-all duration-150',
                    isActive
                      ? 'bg-amber-500/15 rounded text-amber-500 shadow-sm shadow-amber-500/10'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )
                }
              >
                {item.name}
              </NavLink>
              {index < settingItems.length - 1 && (
                <Separator className=" bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default SettingSidebar
