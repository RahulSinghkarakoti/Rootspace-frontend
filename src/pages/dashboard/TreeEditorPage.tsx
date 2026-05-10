import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useSearchParams } from 'react-router-dom'
import { FamilyMemberNode, PersonDetailSidebar, TreeToolbar } from '../../components/layout/index.ts'
import { useTreeStore } from '../../store/treeStore'
import type { PersonDetail } from '../../types/familyTree'
import { useAppStore } from '@/store/appStore'
import CreatePersonDialog from '@/components/dialogs/CreatePersonDialog/CreatePersonDialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { buildFamilyTreeGraph } from '@/utils/treeLayoutUtils.ts'
import { BridgeNode } from '@/components/layout/BridgeNode.tsx'

const nodeTypes = {
  familyMember: FamilyMemberNode,
  bridgeNode: BridgeNode,
}

// ── Loading overlay ───────────────────────────────────────────────────────────

function LoadingOverlay() {
  return (
    <div className="fixed inset-x-0 top-[56px] bottom-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-lg">
        <svg
          className="h-5 w-5 animate-spin text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span className="text-sm text-muted-foreground">Loading family tree…</span>
      </div>
    </div>
  )
}

// ── Error overlay ─────────────────────────────────────────────────────────────

function ErrorOverlay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="fixed inset-x-0 top-[56px] bottom-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-destructive/40 bg-card px-8 py-6 shadow-lg text-center">
        <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
        <p className="text-sm font-medium text-foreground">Failed to load tree</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-1 gap-1.5 text-xs"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    </div>
  )
}

// ── Inner component ───────────────────────────────────────────────────────────

function TreeEditorInner({ sidebarOffset, treeId }: { sidebarOffset: number; treeId: number }) {
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const people          = useTreeStore(s => s.people)
  const relations       = useTreeStore(s => s.relations)
  const isLoading       = useTreeStore(s => s.isLoading)
  const error           = useTreeStore(s => s.error)
  const loadCurrentTree = useTreeStore(s => s.loadCurrentTree)

  const selectedPerson: PersonDetail | null = useMemo(
    () => people.find(p => p.id === selectedId) ?? null,
    [people, selectedId],
  )

  useEffect(() => {
    loadCurrentTree(treeId)
  }, [treeId])

  const handleNodeClick = useCallback(
  (id: string, showInfo: boolean=false) => {
    console.log('Node clicked:', id, 'Show info:', showInfo)
    if (selectedId === id) {
      setSelectedId(null)
      setSidebarOpen(false)
      return
    }

    setSelectedId(id)

    if (showInfo) {
      setSidebarOpen(true)
    }
  },
  [selectedId],
)

  const graph = useMemo(
    () => buildFamilyTreeGraph(people, relations, selectedId, handleNodeClick, treeId),
    [people, relations, selectedId, handleNodeClick, treeId],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges)

  useEffect(() => {
    setNodes(graph.nodes)
    setEdges(graph.edges)
  }, [graph, setNodes, setEdges])

  // ── Edge highlighting ──────────────────────────────────────────────────────
  const styledEdges = useMemo(() => {
    if (!selectedId) return edges

    return edges.map(edge => {
      const directlyConnected =
        edge.source === selectedId ||
        edge.target === selectedId

      const viabridge =
        edge.source.startsWith('bridge-') &&
        (edge.source.includes(`-${selectedId}-`) ||
          edge.source.endsWith(`-${selectedId}`))

      const connected = directlyConnected || viabridge

      if (connected) {
        const color =
          edge.data?.relationType === 'SPOUSE_OF'  ? '#f59e0b' :
          edge.data?.relationType === 'SIBLING_OF' ? '#10b981' :
                                                     '#3b82f6'
        return {
          ...edge,
          style: { ...edge.style, stroke: color, strokeWidth: 3, opacity: 1 },
          animated: edge.data?.relationType === 'PARENT_OF',
          zIndex: 10,
        }
      }

      return {
        ...edge,
        style: { ...edge.style, opacity: 0.12 },
        zIndex: 0,
      }
    })
  }, [edges, selectedId])

  // ── Loading / error / empty gates ─────────────────────────────────────────
  if (isLoading) return <LoadingOverlay />

  if (error) return (
    <ErrorOverlay
      message={typeof error === 'string' ? error : 'An unexpected error occurred.'}
      onRetry={() => loadCurrentTree(treeId)}
    />
  )

  if (people.length === 0) {
    return (
      <div className="fixed inset-x-0 top-[56px] bottom-0 z-10 flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <div className="rounded-2xl border border-border bg-card p-6 text-sm shadow-lg">
          No members found for this tree.
        </div>
        <CreatePersonDialog treeId={treeId}>
          <Button variant="gold" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Person
          </Button>
        </CreatePersonDialog>
      </div>
    )
  }

  const sidebarWidth = sidebarOpen ? 340 : 0

  return (
    <div
      className="fixed inset-x-0 top-[56px] bottom-0 z-10 bg-background overflow-hidden"
      style={{ left: sidebarOffset }}
    >
      {/* Canvas */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{ right: sidebarWidth }}
      >
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={undefined}
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

          <MiniMap
            nodeColor={node => {
              const d = node.data as any
              return d?.gender === 'female' ? 'hsl(350,60%,55%)' : 'hsl(210,60%,55%)'
            }}
            maskColor="hsl(var(--background) / 0.75)"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
            }}
          />

          <Panel position="top-right" style={{ margin: 0, top: 16, right: 16 }}>
            {/* intentionally empty – toolbar rendered outside */}
          </Panel>
        </ReactFlow>

        <TreeToolbar
          memberCount={nodes.length}
          selectedName={selectedPerson?.fullName}
        />
      </div>

      {/* Right sidebar */}
      {sidebarOpen && (
        <PersonDetailSidebar
          person={selectedPerson}
          onClose={() => {
            setSidebarOpen(false)
            setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export default function TreeEditorPage() {
  const [searchParams]       = useSearchParams()
  const treeParam            = Number(searchParams.get('tree'))
  const treeId               = Number.isInteger(treeParam) && treeParam > 0 ? treeParam : 1
  const { sidebarCollapsed } = useAppStore()
  const sidebarOffset        = sidebarCollapsed ? 68 : 260

  return (
    <ReactFlowProvider>
      <TreeEditorInner sidebarOffset={sidebarOffset} treeId={treeId} />
    </ReactFlowProvider>
  )
}