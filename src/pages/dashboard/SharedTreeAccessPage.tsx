import React, { useEffect, useMemo, useState } from 'react'
import { Activity, CalendarClock, Copy, GitBranch, Users, X } from 'lucide-react'
import * as Switch from '@radix-ui/react-switch'
import { formatDistanceToNow } from 'date-fns'
import { treesApi } from '@/api/treesApi'
import { useTreeStore } from '@/store/treeStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import type { SharedTreeItem, TreeShareMember } from '@/types/familyTree'

const formatDateDistance = (value?: string | null) =>
  value ? formatDistanceToNow(new Date(value), { addSuffix: true }) : 'Never'

const getIsActive = (share: SharedTreeItem) => share.isActive ?? true

export default function SharedTreeAccessPage() {
  const loadSharedTrees = useTreeStore((s) => s.loadSharedTrees)
  const sharedTrees = useTreeStore((s) => s.sharedTrees)
  const setSharedTreeActive = useTreeStore((s) => s.setSharedTreeActive)
  const isLoading = useTreeStore((s) => s.gettingSharedTrees)
  const error = useTreeStore((s) => s.error)
  const toast = useToast()
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [updatingToken, setUpdatingToken] = useState<string | null>(null)

  useEffect(() => {
    void loadSharedTrees()
  }, [loadSharedTrees])

  const selectedShare = useMemo(
    () => sharedTrees.find((share) => share.token === selectedToken) ?? null,
    [selectedToken, sharedTrees],
  )

  const handleCopy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied', 'The share link is ready to paste.')
    } catch (err) {
      toast.error('Copy failed', 'Unable to copy the link to clipboard')
    }
  }

  const handleActiveChange = async (share: SharedTreeItem, isActive: boolean) => {
    const previousValue = getIsActive(share)
    setUpdatingToken(share.token)
    setSharedTreeActive(share.token, isActive)

    try {
      await treesApi.updateShareLink(share.tree.id, share.token, { isActive })
      toast.success(
        isActive ? 'Access enabled' : 'Access disabled',
        `${share.tree?.name ?? 'Shared tree'} link is now ${isActive ? 'active' : 'inactive'}.`,
      )
    } catch (err) {
      setSharedTreeActive(share.token, previousValue)
      toast.error('Update failed', 'Unable to update this share link right now.')
    } finally {
      setUpdatingToken(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
          Loading trees...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8 p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-foreground">
          Unable to load trees: {typeof error === 'string' ? error : 'An unexpected error occurred.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Shared Trees</h1>
        <p className="text-sm text-muted-foreground">Manage your trees access</p>
      </div>

      {sharedTrees?.length ? (
        <div className="grid gap-4 overflow-hidden lg:grid-cols-2">
          <div
            className={cn(
              'space-y-2 overflow-y-auto scrollbar-hide transition-all duration-300 ease-out',
              selectedShare ? 'h-[560px] lg:pr-1' : 'h-[400px] lg:col-span-2',
            )}
          >
            {sharedTrees.map((share) => (
              <SharedTreeAccessRow
                key={share.id}
                share={share}
                selected={share.token === selectedToken}
                updating={updatingToken === share.token}
                onCopy={() => handleCopy(share.link)}
                onSelect={() => setSelectedToken((current) => (current === share.token ? null : share.token))}
                onActiveChange={(isActive) => handleActiveChange(share, isActive)}
              />
            ))}
          </div>

          <div
            className={cn(
              'min-h-[320px] overflow-hidden transition-all duration-300 ease-out',
              selectedShare
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none h-0 translate-x-6 opacity-0 lg:h-auto',
            )}
          >
            {selectedShare ? (
              <MemberAccessPanel share={selectedShare} onClose={() => setSelectedToken(null)} />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <GitBranch className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No shared trees yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Invite family members to contribute to your trees</p>
        </div>
      )}
    </div>
  )
}

interface SharedTreeAccessRowProps {
  share: SharedTreeItem
  selected: boolean
  updating: boolean
  onCopy: () => void
  onSelect: () => void
  onActiveChange: (isActive: boolean) => void
}

function SharedTreeAccessRow({
  share,
  selected,
  updating,
  onCopy,
  onSelect,
  onActiveChange,
}: SharedTreeAccessRowProps) {
  const active = getIsActive(share)

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border p-3 transition-all hover:border-amber-500/30 hover:bg-amber-500/5 sm:flex-row sm:items-center sm:justify-between',
        selected && 'border-amber-500/50 bg-amber-500/5 shadow-sm',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <GitBranch className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <div className="mb-0.5 flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">{share.tree?.name}</h3>
            <Badge variant="gold" className="shrink-0 text-[10px]">
              {share.permission}
            </Badge>
            <Badge variant={active ? 'secondary' : 'outline'} className="shrink-0 text-[10px]">
              {active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{share.link}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {share.expiresAt && (
          <div className="text-xs text-muted-foreground">
            Expires {formatDateDistance(share.expiresAt)}
          </div>
        )}

        <label className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          <Switch.Root
            checked={active}
            disabled={updating}
            onCheckedChange={onActiveChange}
            className="relative h-5 w-9 rounded-full bg-muted transition-colors data-[state=checked]:bg-emerald-500 disabled:opacity-60"
            aria-label="Toggle share link activity"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-background shadow transition-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          {active ? 'On' : 'Off'}
        </label>

        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCopy} title="Copy link">
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" variant={selected ? 'secondary' : 'outline'} className="h-7 gap-1.5 px-2" onClick={onSelect}>
          <Users className="h-3.5 w-3.5" />
          Access
        </Button>
      </div>
    </div>
  )
}

function MemberAccessPanel({ share, onClose }: { share: SharedTreeItem; onClose: () => void }) {
  const members = share.members ?? []

  return (
    <aside className="h-full rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-500" />
            <h2 className="truncate text-base font-semibold text-foreground">Member access</h2>
          </div>
          <p className="truncate text-xs text-muted-foreground">{share.tree.name}</p>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose} title="Close member access">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <AccessMetric label="Members" value={members.length.toString()} />
        <AccessMetric label="Limit" value={share.personLimit ? share.personLimit.toString() : 'None'} />
      </div>

      <div className="space-y-3">
        {members.length ? (
          members.map((member) => <MemberAccessItem key={member.id} member={member} />)
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No member activity yet</p>
            <p className="mt-1 text-xs text-muted-foreground">People who open this link will appear here.</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function AccessMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function MemberAccessItem({ member }: { member: TreeShareMember }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-foreground">Member {member.userId.slice(0, 8)}</p>
        <Badge variant="outline" className="text-[10px]">
          {member.addedPersonsCount} added
        </Badge>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          Joined {formatDateDistance(member.joinedAt)}
        </p>
        <p className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          Updated {formatDateDistance(member.updatedAt)}
        </p>
      </div>
    </div>
  )
}
