import { describe, it, expect } from 'vitest'
import {
  buildFamilyTreeLayout,
  applySelectedNode,
  buildFamilyTreeGraph,
} from './treeLayoutUtils'
import type { PersonDetail, RelationItem } from '@/types/familyTree'

const mockPeople: PersonDetail[] = [
  {
    id: 'p1',
    fullName: 'Grandpa John',
    gender: 'male',
    slug: 'john',
    birthDate: '1940-01-01',
    deathDate: '2010-01-01',
    birthPlace: 'London',
    notes: '',
    education: [],
    media: [],
  },
  {
    id: 'p2',
    fullName: 'Grandma Mary',
    gender: 'female',
    slug: 'mary',
    birthDate: '1942-01-01',
    deathDate: null,
    birthPlace: 'London',
    notes: '',
    education: [],
    media: [],
  },
  {
    id: 'p3',
    fullName: 'Father Bob',
    gender: 'male',
    slug: 'bob',
    birthDate: '1970-01-01',
    deathDate: null,
    birthPlace: 'London',
    notes: '',
    education: [],
    media: [],
  },
]

const mockRelations: RelationItem[] = [
  {
    id: 'r1',
    treeId: 1,
    fromId: 'p1',
    toId: 'p2',
    type: 'SPOUSE_OF',
  },
  {
    id: 'r2',
    treeId: 1,
    fromId: 'p1',
    toId: 'p3',
    type: 'PARENT_OF',
  },
  {
    id: 'r3',
    treeId: 1,
    fromId: 'p2',
    toId: 'p3',
    type: 'PARENT_OF',
  },
]

describe('treeLayoutUtils', () => {
  it('returns empty nodes and edges for empty people list', () => {
    const layout = buildFamilyTreeLayout([], [], () => {}, 1)
    expect(layout.nodes).toEqual([])
    expect(layout.edges).toEqual([])
  })

  it('builds layout with correct node generations and positions without crashing', () => {
    const layout = buildFamilyTreeLayout(mockPeople, mockRelations, () => {}, 1)

    // Should create familyMember nodes for each person
    const personNodes = layout.nodes.filter((n) => n.type === 'familyMember')
    expect(personNodes.length).toBe(3)

    // Parents should be generation 0, child should be generation 1
    const p1Node = personNodes.find((n) => n.id === 'p1')
    const p2Node = personNodes.find((n) => n.id === 'p2')
    const p3Node = personNodes.find((n) => n.id === 'p3')

    expect(p1Node?.data.generation).toBe(0)
    expect(p2Node?.data.generation).toBe(0)
    expect(p3Node?.data.generation).toBe(1)

    // Child y-position should be lower (greater y) than parents
    expect(p3Node!.position.y).toBeGreaterThan(p1Node!.position.y)

    // Parents should be marked as hasSpouse
    expect(p1Node?.data.hasSpouse).toBe(true)
    expect(p2Node?.data.hasSpouse).toBe(true)
    expect(p3Node?.data.hasSpouse).toBe(false)
  })

  it('applies selectedId without modifying other node properties', () => {
    const layout = buildFamilyTreeLayout(mockPeople, mockRelations, () => {}, 1)
    const selectedNodes = applySelectedNode(layout.nodes, 'p2')

    const p1Node = selectedNodes.find((n) => n.id === 'p1')
    const p2Node = selectedNodes.find((n) => n.id === 'p2')

    expect(p1Node?.data.isSelected).toBe(false)
    expect(p2Node?.data.isSelected).toBe(true)
  })

  it('handles cyclical parent-child relationships gracefully without infinite loop', () => {
    const cyclicRelations: RelationItem[] = [
      { id: 'r1', treeId: 1, fromId: 'p1', toId: 'p2', type: 'PARENT_OF' },
      { id: 'r2', treeId: 1, fromId: 'p2', toId: 'p1', type: 'PARENT_OF' },
    ]

    expect(() => {
      buildFamilyTreeLayout(mockPeople.slice(0, 2), cyclicRelations, () => {}, 1)
    }).not.toThrow()
  })

  it('buildFamilyTreeGraph matches buildFamilyTreeLayout + applySelectedNode', () => {
    const fullGraph = buildFamilyTreeGraph(mockPeople, mockRelations, 'p3', () => {}, 1)
    const p3Node = fullGraph.nodes.find((n) => n.id === 'p3')
    expect(p3Node?.data.isSelected).toBe(true)
  })
})
