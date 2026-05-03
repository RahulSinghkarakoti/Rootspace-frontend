import { GitBranch, Plus, Share2, Search, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const trees = [
  { id: 1, name: 'Johnson Family Tree', members: 34, updated: '2 hours ago', shared: true, records: 12 },
  { id: 2, name: 'Smith Maternal Line', members: 12, updated: '3 days ago', shared: false, records: 8 },
  { id: 3, name: 'Williams Heritage', members: 8, updated: '1 week ago', shared: false, records: 4 },
]

export function TreesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">My Trees</h1>
          <p className="text-sm text-muted-foreground">Manage all your family trees</p>
        </div>
        <Link to="/dashboard/editor">
          <Button variant="gold" className="gap-2">
            <Plus className="h-4 w-4" /> New Tree
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {trees.map((tree) => (
          <Card key={tree.id} className="group hover:border-amber-500/30 transition-all">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                  <GitBranch className="h-5 w-5 text-amber-500" />
                </div>
                {tree.shared && <Badge variant="gold" className="text-[10px]">Shared</Badge>}
              </div>
              <h3 className="font-semibold text-foreground mb-1">{tree.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {tree.members} members · {tree.records} records · Updated {tree.updated}
              </p>
              <div className="flex gap-2">
                <Link to={`/dashboard/editor?tree=${tree.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> Open Editor
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create new */}
        <Link to="/dashboard/editor">
          <Card className="border-dashed hover:border-amber-500/40 hover:bg-amber-500/5 transition-all cursor-pointer h-full min-h-[180px]">
            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Create New Tree</p>
                <p className="text-xs text-muted-foreground mt-0.5">Start from scratch</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export function AncestralSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Ancestral Search</h1>
        <p className="text-sm text-muted-foreground">Discover records and relatives from historical databases</p>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, location, or year..."
            className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button variant="gold">Search Records</Button>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground">Enter a name to search ancestral records</p>
        <p className="text-xs text-muted-foreground mt-1">Access 180M+ historical records worldwide</p>
      </div>
    </div>
  )
}

export function SharedTreesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Shared Trees</h1>
        <p className="text-sm text-muted-foreground">Trees shared with you or by you</p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <Share2 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground">No shared trees yet</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Share your tree to collaborate with family members</p>
        <Link to="/dashboard/trees">
          <Button variant="gold" size="sm">Go to My Trees</Button>
        </Link>
      </div>
    </div>
  )
}

export function CollaboratorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Collaborators</h1>
        <p className="text-sm text-muted-foreground">Manage people who can view or edit your trees</p>
      </div>
      <div className="rounded-xl border border-dashed border-border p-16 text-center">
        <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm font-medium text-foreground">No collaborators yet</p>
        <p className="text-xs text-muted-foreground mt-1">Invite family members to contribute to your trees</p>
      </div>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Settings page coming soon. Use the profile dropdown in the top navbar to sign out.</p>
        </CardContent>
      </Card>
    </div>
  )
}
