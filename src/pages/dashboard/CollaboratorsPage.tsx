import { GitBranch } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function CollaboratorsPage() {
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
