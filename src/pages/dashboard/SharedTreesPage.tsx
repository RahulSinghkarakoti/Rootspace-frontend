import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AlertTriangle, Plus, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FamilyMemberNode, PersonDetailSidebar, TreeToolbar } from '@/components/layout'
import { BridgeNode } from '@/components/layout/BridgeNode'
import CreatePersonDialog from '@/components/dialogs/CreateUpdatePersonDialog/CreatePersonDialog'
import { treesApi } from '@/api/treesApi'
import { useSharedTreeStore } from '@/store/sharedTreeStore'
import { buildFamilyTreeGraph } from '@/utils/treeLayoutUtils'
import { hasPermissionRight } from '@/utils/permission'
import type { PersonDetail, RelationItem } from '@/types/familyTree'

const nodeTypes = {
  familyMember: FamilyMemberNode,
  bridgeNode: BridgeNode,
}

function LoadingState() {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-background">
      <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-lg">
        Verifying shared tree...
      </div>
    </div>
  )
}

function EmptyTokenState() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Share2 className="h-10 w-10 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">Share token missing</p>
        <p className="mt-1 text-xs text-muted-foreground">Open the complete shared link to view this tree.</p>
      </div>
      <Link to="/dashboard/trees">
        <Button variant="outline" size="sm">Go to My Trees</Button>
      </Link>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <div>
        <p className="text-sm font-medium text-foreground">Unable to open shared tree</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  )
}

function SharedTreeCanvas({ token }: { token: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showMinMap, setShowMinMap] = useState(true)
  const access = useSharedTreeStore((state) => state.access)
  const treeData = useSharedTreeStore((state) => state.treeData)
  const people = useSharedTreeStore((state) => state.people)
  const relations = useSharedTreeStore((state) => state.relations)
  const addPerson = useSharedTreeStore((state) => state.addPerson)
  const upsertPerson = useSharedTreeStore((state) => state.upsertPerson)
  const addRelations = useSharedTreeStore((state) => state.addRelations)
  const removePerson = useSharedTreeStore((state) => state.removePerson)

  const canAddPerson = hasPermissionRight(access?.permission, 'add_person')
  const canUploadAvatar = hasPermissionRight(access?.permission, 'media') || hasPermissionRight(access?.permission, 'edit_any')
  const canEditAny = hasPermissionRight(access?.permission, 'edit_any')
  const canEditOwn = hasPermissionRight(access?.permission, 'edit_own')
  let remainingAdds = access?.personLimit == null
    ? null
    : Math.max(0, access.personLimit - access.member.addedPersonsCount)
  const addLimitReached = remainingAdds === 0
  const canCreateMore = canAddPerson && !addLimitReached

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')

    const handler = (e: { matches: any }) => setShowMinMap(!e.matches)

    setShowMinMap(prev => !prev)
    media.addEventListener('change', handler)

    return () => media.removeEventListener('change', handler)
  }, [])

  const selectedPerson: PersonDetail | null = useMemo(
    () => people.find((person) => person.id === selectedId) ?? null,
    [people, selectedId],
  )

  const handleSharedPersonCreated = useCallback((payload: {
    newPerson: PersonDetail
    createdRelations: RelationItem[]
    unknownSpouse?: PersonDetail | null
  }) => {
    addPerson(payload.newPerson)
    if (payload.unknownSpouse) addPerson(payload.unknownSpouse)
    addRelations(payload.createdRelations)
  }, [addPerson, addRelations])

  const handleSharedPersonDeleted = useCallback(async (personId: string) => {
    const response = await treesApi.deleteSharedPerson(token, personId)
    removePerson(personId, response.data.data.decrementAddedCount)
    setSelectedId(null)
    setSidebarOpen(false)
  }, [removePerson, token])

  const handleNodeClick = useCallback((id: string, showInfo = false) => {
    if (selectedId === id) {
      setSelectedId(null)
      setSidebarOpen(false)
      return
    }
    setSelectedId(id)
    if (showInfo) setSidebarOpen(true)
  }, [selectedId])

  const graph = useMemo(() => {
    if (!treeData) return { nodes: [], edges: [] }
    const built = buildFamilyTreeGraph(people, relations, selectedId, handleNodeClick, treeData.id)
    return {
      nodes: built.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          canAddPerson: canCreateMore,
          canEditPerson: canEditAny || (canEditOwn && people.some((person) => person.id === node.data.id && person.createdByMemberId === access?.member.id)),
          canUploadAvatar,
          sharedToken: token,
          onSharedPersonCreated: handleSharedPersonCreated,
          onSharedPersonUpdated: upsertPerson,
        },
      })),
      edges: built.edges,
    }
  }, [people, relations, selectedId, handleNodeClick, treeData, canCreateMore, canEditAny, canEditOwn, access?.member.id, canUploadAvatar, token, handleSharedPersonCreated, upsertPerson])

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges)

  useEffect(() => {
    setNodes(graph.nodes)
    setEdges(graph.edges)
  }, [graph, setNodes, setEdges])

  if (!treeData || !access) return null

  if (people.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-lg border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-lg">
          No members found for this shared tree.
        </div>
        {canCreateMore && (
          <CreatePersonDialog
            treeId={treeData.id}
            sharedToken={token}
            onSharedSuccess={handleSharedPersonCreated}
          >
            <Button variant="gold" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add First Person
            </Button>
          </CreatePersonDialog>
        )}
      </div>
    )
  }

  const sidebarWidth = sidebarOpen ? 340 : 0

  return (
    <div className="fixed inset-0 z-10 bg-background">
      <div className="absolute left-4 top-4 z-20 rounded-lg border border-border bg-card/95 px-4 py-2 shadow-lg backdrop-blur">
        <p className="text-sm font-semibold text-foreground">{treeData.name}</p>
        <p className="text-xs text-muted-foreground">
          {access.permission.replace(/_/g, ' ').toLowerCase()}
          {remainingAdds !== null ? ` · ${remainingAdds} additions left` : ''}
        </p>
      </div>

      <div className="absolute inset-0 transition-all duration-300" style={{ right: sidebarWidth }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodesDraggable={false}
          nodesConnectable={false}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.04}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          style={{ width: '100%', height: '100%', background: 'hsl(var(--background))' }}
          onPaneClick={() => {
            setSelectedId(null)
            setSidebarOpen(false)
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.4}
            color="hsl(var(--foreground) / 0.12)"
          />

          {
            showMinMap && (

              <MiniMap
                nodeColor={(node) => {
                  const data = node.data as any
                  return data?.gender === 'female' ? 'hsl(350,60%,55%)' : 'hsl(210,60%,55%)'
                }}
                maskColor="hsl(var(--background) / 0.75)"
                style={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 10,
                }}
              />
            )
          }
        </ReactFlow>

        <TreeToolbar
          memberCount={treeData._count?.persons || people.length}
          selectedName={selectedPerson?.fullName}
          toggleMinimap={() => setShowMinMap((s) => !s)}
        />
      </div>

      {sidebarOpen && (
        <PersonDetailSidebar
          fullLength={true}
          person={selectedPerson}
          canUploadAvatar={canUploadAvatar}
          canManageEducation={canEditAny || canEditOwn}
          canDelete={canEditAny || (canEditOwn && selectedPerson?.createdByMemberId === access.member.id)}
          sharedToken={token}
          onDeletePerson={handleSharedPersonDeleted}
          onClose={() => {
            setSidebarOpen(false)
            setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}

export default function SharedTreesPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || ''
  const isLoading = useSharedTreeStore((state) => state.isLoading)
  const error = useSharedTreeStore((state) => state.error)
  const verifyAndLoad = useSharedTreeStore((state) => state.verifyAndLoad)
  const clear = useSharedTreeStore((state) => state.clear)

  useEffect(() => {
    if (!token) {
      clear()
      return
    }
    verifyAndLoad(token)
  }, [token, verifyAndLoad, clear])

  if (!token) return <EmptyTokenState />
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={() => verifyAndLoad(token)} />

  return (
    <ReactFlowProvider>
      <SharedTreeCanvas token={token} />
    </ReactFlowProvider>
  )
}
