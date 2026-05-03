import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  type Connection,
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
import { Plus } from 'lucide-react'
import { buildFamilyTreeGraph } from '@/utils/treeLayoutUtils.ts'
import { BridgeNode } from '@/components/layout/BridgeNode.tsx'

const nodeTypes = { familyMember: FamilyMemberNode,
   bridgeNode: BridgeNode,
 }

// ── Inner component ───────────────────────────────────────────────────────────

function TreeEditorInner({ sidebarOffset, treeId}: { sidebarOffset: number; treeId: number }) {
  const [selectedId, setSelectedId]   = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const people      = useTreeStore(s => s.people)
  const relations   = useTreeStore(s => s.relations)
  const isLoading   =  useTreeStore(s => s.isLoading)
  const error       = useTreeStore(s => s.error)
  const loadCurrentTree = useTreeStore(s => s.loadCurrentTree)

  const selectedPerson: PersonDetail | null = useMemo(
    () => people.find(p => p.id === selectedId) ?? null,
    [people, selectedId],
  )

  useEffect(() => {
    loadCurrentTree(treeId)
  }, [ treeId])


  const handleNodeClick = useCallback(
    (id: string) => {
      if (selectedId === id) {
        setSelectedId(null)
        setSidebarOpen(false)
      } else {
        setSelectedId(id)
        setSidebarOpen(true)
      }
    },
    [selectedId],
  )

  // ── Use the new custom layout ──────────────────────────────────────────────
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

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5, opacity: 0.7 },
          },
          eds,
        ),
      ),
    [setEdges],
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
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
  const [searchParams]    = useSearchParams()
  const treeParam         = Number(searchParams.get('tree'))
  const treeId            = Number.isInteger(treeParam) && treeParam > 0 ? treeParam : 1
  const { sidebarCollapsed } = useAppStore()
  const sidebarOffset     = sidebarCollapsed ? 68 : 260

  return (
    <ReactFlowProvider>
      <TreeEditorInner sidebarOffset={sidebarOffset} treeId={treeId} />
    </ReactFlowProvider>
    
  )
}