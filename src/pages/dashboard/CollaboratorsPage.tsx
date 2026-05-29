import React, { useEffect } from 'react'
import { GitBranch, Copy, ExternalLink } from 'lucide-react'
import { useTreeStore } from '@/store/treeStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { formatDistanceToNow } from 'date-fns'

export default function CollaboratorsPage() {
  const loadCollaborations = useTreeStore(s => s.loadCollaborations)
  const collaborations = useTreeStore(s => s.collaborations)
  const isLoading = useTreeStore(s => s.gettinCollaborations)
  const error = useTreeStore(s => s.error)
  const toast = useToast()

  useEffect(() => {
    void loadCollaborations()
  }, [loadCollaborations])

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        Loading collaborators...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-foreground">
        Unable to load collaborators: {typeof error === 'string' ? error : 'An unexpected error occurred.'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Collaborators</h1>
        <p className="text-sm text-muted-foreground">Manage people who can view or edit your trees</p>
      </div>

      {collaborations?.length ? (
        <div className="space-y-2">
          {collaborations.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <GitBranch className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-sm text-foreground truncate">{c.tree?.name}</h3>
                    <Badge variant="gold" className="text-[10px] shrink-0">
                      {c.permission}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{c.link}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.expiresAt && (
                  <div className="text-xs text-muted-foreground">
                    Expires {formatDistanceToNow(new Date(c.expiresAt), { addSuffix: true })}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(c.link)
                        toast.success('Link copied', 'The share link is ready to paste.')
                      } catch (err) {
                        toast.error('Copy failed', 'Unable to copy the link to clipboard')
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7"
                    onClick={() => window.open(c.link, '_blank', 'noopener,noreferrer')}
                    aria-label="Open link in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No collaborators yet</p>
          <p className="text-xs text-muted-foreground mt-1">Invite family members to contribute to your trees</p>
        </div>
      )}
    </div>
  )
}
