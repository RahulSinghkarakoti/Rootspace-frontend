import { GitBranch, Users, Share2, Search, Plus, ArrowUpRight, Clock, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { treesApi } from '@/api/treesApi'
import { useAppStore } from '@/store/appStore'
import type { DashboardData } from '@/types/dashboard.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

let pendingDashboardStats: Promise<DashboardData> | null = null

const statColors = [
  { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { color: 'text-green-500', bg: 'bg-green-500/10' },
  { color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

function formatActivityTime(dateInput: Date | string | number) {
  try {
    const d = new Date(dateInput)
    return isNaN(d.getTime()) ? '' : formatDistanceToNow(d, { addSuffix: true })
  } catch {
    return ''
  }
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? t('dashboard.goodMorning')
      : hour < 18
      ? t('dashboard.goodAfternoon')
      : t('dashboard.goodEvening')

  const cachedDashboard = useAppStore(state => state.dashboard)
  const dashboardFetchedAt = useAppStore(state => state.dashboardFetchedAt)
  const setCachedDashboard = useAppStore(state => state.setDashboard)
  const dashboard = cachedDashboard
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  useEffect(() => {
    let mounted = true

    const cacheIsFresh = cachedDashboard && dashboardFetchedAt && Date.now() - dashboardFetchedAt < CACHE_TTL
    if (cacheIsFresh) {
      return
    }

    if (!pendingDashboardStats) {
      pendingDashboardStats = treesApi.getDashboardStats()
        .then(res => res.data.data)
        .finally(() => {
          pendingDashboardStats = null
        })
    }

    setLoading(true)
    pendingDashboardStats
      .then(res => {
        if (!mounted) return
        setCachedDashboard(res)
        setError(null)
      })
      .catch(err => {
        if (!mounted) return
        setError(err?.message || 'Failed to load dashboard')
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [cachedDashboard, dashboardFetchedAt, setCachedDashboard])

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="font-display text-3xl font-bold text-foreground mt-0.5">
            {user?.firstName}'s {t('dashboard.dashboard')}
          </h1>
        </div>
        <Link to="/dashboard/trees">
          <Button variant="gold" className="gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="h-4 w-4" />
            {t('dashboard.newFamilyTree')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.familyTrees'), value: dashboard ? String(dashboard.kpis.totalOwnedTrees) : '—', icon: GitBranch, change: '', ...statColors[0] },
          { label: t('dashboard.membersAdded'), value: dashboard ? String(dashboard.kpis.totalPersons) : '—', icon: Users, change: '', ...statColors[1] },
          { label: t('dashboard.sharedTrees'), value: dashboard ? String(dashboard.kpis.totalSharedTrees) : '—', icon: Share2, change: '', ...statColors[2] },
          { label: t('dashboard.recordsFound'), value: dashboard ? String(dashboard.kpis.totalMedia) : '—', icon: Search, change: '', ...statColors[3] },
        ].map(({ label, value, icon: Icon, change, color, bg }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground font-mono">{value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              <p className={`text-xs mt-2 font-medium ${color}`}>{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t('dashboard.yourTrees')}</CardTitle>
                <Link to="/dashboard/trees">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground text-xs">
                    {t('dashboard.viewAll')} <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {dashboard?.ownedTrees?.map((tree) => (
                  <Link key={tree.id} to={`/dashboard/trees?tree=${tree.id}`}>
                    <div className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                        <GitBranch className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{tree.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tree._count?.persons ?? 0} {t('dashboard.members')} · {new Date(tree.createdAt).toLocaleString(undefined)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {tree._count && <Badge variant="gold" className="text-[10px]">{t('dashboard.sharedBadge')}</Badge>}
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                ))}

                <Link to="/dashboard/trees">
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t('dashboard.createANewFamilyTree')}</p>
                  </div>
                </Link>
              </CardContent>
          </Card>
        </div>

        <div>
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t('dashboard.recentActivity')}</CardTitle>
                {dashboard?.recentActivities && dashboard.recentActivities.length > 0 && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {dashboard.recentActivities.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-0">
              {!dashboard?.recentActivities || dashboard.recentActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">{t('dashboard.noRecentActivity')}</p>
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-3">
                  <div className="space-y-3">
                    {dashboard.recentActivities.map((item) => (
                      <div key={item.id} className="flex gap-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">
                            <span className="text-amber-500 font-medium">
                              {t(`dashboard.activity.${item.action}`) || item.action}
                            </span>{' '}
                            <span className="truncate">{item.entity || item.metadata?.name || ''}</span>
                          </p>
                          {item.metadata?.treeName && (
                            <p className="text-xs text-muted-foreground truncate">{item.metadata.treeName}</p>
                          )}
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            {formatActivityTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
        <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-6">
          <Sparkles className="h-8 w-8 text-amber-500 shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-foreground">{t('dashboard.upgradeToPro')}</p>
            <p className="text-sm text-muted-foreground">{t('dashboard.upgradeDescription')}</p>
          </div>
          <Button variant="gold" className="shrink-0 shadow-lg shadow-amber-500/20">
            {t('dashboard.upgradeButton')}
          </Button>
        </CardContent>
      </Card> */}
    </div>
  )
}
