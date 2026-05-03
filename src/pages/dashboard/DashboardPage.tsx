import { GitBranch, Users, Share2, Search, Plus, ArrowUpRight, Clock, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const statCards = [
  { label: 'Family Trees', value: '3', icon: GitBranch, change: '+1 this month', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Members Added', value: '47', icon: Users, change: '+8 this week', color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: 'Shared Trees', value: '2', icon: Share2, change: '12 viewers', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { label: 'Records Found', value: '124', icon: Search, change: '+18 new matches', color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

const recentTrees = [
  { id: 1, name: 'Johnson Family Tree', members: 34, updated: '2 hours ago', shared: true },
  { id: 2, name: 'Smith Maternal Line', members: 12, updated: '3 days ago', shared: false },
  { id: 3, name: 'Williams Heritage', members: 8, updated: '1 week ago', shared: false },
]

const recentActivity = [
  { action: 'Added', subject: 'Margaret Eleanor Johnson', tree: 'Johnson Family', time: '2h ago', type: 'add' },
  { action: 'Shared', subject: 'Johnson Family Tree', tree: '', time: '5h ago', type: 'share' },
  { action: 'Found', subject: '3 new ancestral records', tree: 'Smith Maternal', time: '1d ago', type: 'search' },
  { action: 'Updated', subject: 'Robert Smith (1892–1961)', tree: 'Smith Maternal', time: '2d ago', type: 'edit' },
]

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  const greeting =
    hour < 12
      ? t('dashboard.goodMorning')
      : hour < 18
      ? t('dashboard.goodAfternoon')
      : t('dashboard.goodEvening')

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{greeting} 👋</p>
          <h1 className="font-display text-3xl font-bold text-foreground mt-0.5">
            {user?.firstName}'s {t('dashboard.dashboard')}
          </h1>
        </div>
        <Link to="/dashboard/editor">
          <Button variant="gold" className="gap-2 shadow-lg shadow-amber-500/20">
            <Plus className="h-4 w-4" />
            {t('dashboard.newFamilyTree')}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, change, color, bg }) => (
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
              {recentTrees.map((tree) => (
                <Link key={tree.id} to={`/dashboard/editor?tree=${tree.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                      <GitBranch className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{tree.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {tree.members} members · Updated {tree.updated}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {tree.shared && <Badge variant="gold" className="text-[10px]">Shared</Badge>}
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}

              <Link to="/dashboard/editor">
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
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">{t('dashboard.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="text-amber-500 font-medium">{item.action}</span>{' '}
                      {item.subject}
                    </p>
                    {item.tree && (
                      <p className="text-xs text-muted-foreground">{item.tree}</p>
                    )}
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
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
      </Card>
    </div>
  )
}
