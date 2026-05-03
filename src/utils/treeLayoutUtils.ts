
import type { Node, Edge } from '@xyflow/react'

// ── Shared Types ──────────────────────────────────────────────────────────────

export interface PersonDetail {
    id: string
    fullName: string
    gender?: 'male' | 'female' | string
    birthDate?: string | null
    deathDate?: string | null
    education?: unknown[]
    media?: unknown[]
}

export interface RelationItem {
    id: string
    treeId: number
    fromId: string
    toId: string
    type: 'PARENT_OF' | 'SPOUSE_OF' | 'SIBLING_OF' | string
    metadata?: unknown
    isActive?: boolean
}

// ── Layout Constants ──────────────────────────────────────────────────────────



const NODE_W = 64    // ← was 130, match your actual node width
const NODE_H = 100   // ← increase to account for name label below circle
const H_GAP = 60     // ← give more breathing room between units  
const COUPLE_GAP = 100  // ← gap between spouses (enough for the ⚭ line)
const V_GAP = 120
// ── 1. Build directed parent→child map ───────────────────────────────────────

function buildParentChildMap(relations: RelationItem[]) {
    const parentToChildren = new Map<string, Set<string>>()
    const childToParents = new Map<string, Set<string>>()

    for (const r of relations) {
        if (r.type !== 'PARENT_OF') continue
        const p = r.fromId, c = r.toId

        // ── GUARD: skip if this would create a cycle ──────────────────────────
        // i.e. c is already an ancestor of p
        if (p === c) {
            console.warn('[buildParentChildMap] self-loop skipped', p)
            continue
        }
        // Check if p is already a descendant of c (would create a cycle)
        const visited = new Set<string>()
        const queue = [c]
        let isCycle = false
        while (queue.length > 0) {
            const curr = queue.shift()!
            if (curr === p) { isCycle = true; break }
            if (visited.has(curr)) continue
            visited.add(curr)
            for (const child of parentToChildren.get(curr) ?? []) queue.push(child)
        }
        if (isCycle) {
            console.warn('[buildParentChildMap] cycle detected, skipped relation', r)
            continue
        }
        // ─────────────────────────────────────────────────────────────────────

        if (!parentToChildren.has(p)) parentToChildren.set(p, new Set())
        if (!childToParents.has(c)) childToParents.set(c, new Set())
        parentToChildren.get(p)!.add(c)
        childToParents.get(c)!.add(p)
    }

    return { parentToChildren, childToParents }
}

// ── 2. Build spouse map (store only ONE canonical direction) ──────────────────

function buildSpouseMap(relations: RelationItem[]): Map<string, string> {
    // Map<personA, personB> — only the first-seen direction per pair
    const spouseOf = new Map<string, string>()
    const seenPairs = new Set<string>()

    for (const r of relations) {
        if (r.type !== 'SPOUSE_OF') continue
        const key = [r.fromId, r.toId].sort().join('|')
        if (seenPairs.has(key)) continue
        seenPairs.add(key)
        // Both directions so lookup is easy, but only ONE canonical entry per pair
        spouseOf.set(r.fromId, r.toId)
        spouseOf.set(r.toId, r.fromId)
    }

    return spouseOf
}

// ── 3. Assign integer generation levels (BFS, no while-loop oscillation) ─────

function assignGenerations(
    personIds: string[],
    parentToChildren: Map<string, Set<string>>,
    childToParents: Map<string, Set<string>>,
    spouseOf: Map<string, string>,
): Map<string, number> {

    const gen = new Map<string, number>()

    // Roots = people with no recorded parents
    let roots = personIds.filter(
        id => !childToParents.has(id) || childToParents.get(id)!.size === 0
    )
    if (roots.length === 0) {
        // Fallback: pick person with most children
        let best = personIds[0], bestCount = 0
        for (const id of personIds) {
            const count = parentToChildren.get(id)?.size ?? 0
            if (count > bestCount) { best = id; bestCount = count }
        }
        roots = [best]
    }

    // BFS downward
    const queue: string[] = []
    for (const id of roots) { gen.set(id, 0); queue.push(id) }

    while (queue.length > 0) {
        const parentId = queue.shift()!
        const parentGen = gen.get(parentId) ?? 0
        for (const childId of parentToChildren.get(parentId) ?? []) {
            const proposed = parentGen + 1
            if ((gen.get(childId) ?? -1) < proposed) {
                gen.set(childId, proposed)
                queue.push(childId)
            }
        }
    }

    // Ensure every person has a level
    for (const id of personIds) {
        if (!gen.has(id)) gen.set(id, 0)
    }

    // Align spouses to the SAME generation (single pass, no loop needed)
    // We collect canonical pairs (avoid double-processing bidirectional map)
    const processedPairs = new Set<string>()
    for (const [a, b] of spouseOf) {
        const key = [a, b].sort().join('|')
        if (processedPairs.has(key)) continue
        processedPairs.add(key)

        const ga = gen.get(a) ?? 0
        const gb = gen.get(b) ?? 0
        const maxGen = Math.max(ga, gb)
        gen.set(a, maxGen)
        gen.set(b, maxGen)
    }

    return gen
}

// ── 4. Group each generation into "couple units" ──────────────────────────────

interface CoupleUnit {
    primary: string
    spouse?: string
    children: string[]
}

function buildCoupleUnits(
    personIds: string[],
    generations: Map<string, number>,
    spouseOf: Map<string, string>,
    parentToChildren: Map<string, Set<string>>,
): Map<number, CoupleUnit[]> {

    const assigned = new Set<string>()
    const byGen = new Map<number, CoupleUnit[]>()
    const maxGen = Math.max(...generations.values(), 0)

    for (let g = 0; g <= maxGen; g++) {
        const units = [] as CoupleUnit[]
        const inThisGen = personIds.filter(id => (generations.get(id) ?? 0) === g)

        for (const id of inThisGen) {
            if (assigned.has(id)) continue
            assigned.add(id)

            const spouse = spouseOf.get(id)
            const unit: CoupleUnit = { primary: id, children: [] }

            if (spouse && !assigned.has(spouse) && (generations.get(spouse) ?? -1) === g) {
                assigned.add(spouse)
                unit.spouse = spouse
            }

            // Children = union of primary's children + spouse's children
            const childSet = new Set([
                ...(parentToChildren.get(id) ?? []),
                ...(unit.spouse ? parentToChildren.get(unit.spouse) ?? [] : []),
            ])
            unit.children = [...childSet]

            units.push(unit)
        }

        byGen.set(g, units)
    }

    return byGen
}

// ── 5. Compute X/Y positions ──────────────────────────────────────────────────

interface PosInfo {
    x: number
    y: number
    mid: number   // horizontal centre of the unit (for child drop-line)
}

function computePositions(byGen: Map<number, CoupleUnit[]>): Map<string, PosInfo> {
    const pos = new Map<string, PosInfo>()
    const maxGen = Math.max(...byGen.keys(), 0)

    // ── Top-down initial placement ────────────────────────────────────────────
    for (let g = 0; g <= maxGen; g++) {
        const units = byGen.get(g) ?? []
        const y = g * (NODE_H + V_GAP) + 40
        let cursor = 40

        for (const unit of units) {
            const unitW = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
            const mid = cursor + unitW / 2

            pos.set(unit.primary, { x: cursor, y, mid })
            if (unit.spouse) {
                pos.set(unit.spouse, { x: cursor + NODE_W + COUPLE_GAP, y, mid })
            }
            cursor += unitW + H_GAP
        }
    }

    // ── Centre parents over their children (3 passes is plenty) ──────────────
    for (let _pass = 0; _pass < 3; _pass++) {
        for (let g = maxGen - 1; g >= 0; g--) {
            const units = byGen.get(g) ?? []

            for (const unit of units) {
                if (unit.children.length === 0) continue

                const childXs = unit.children
                    .map(cid => pos.get(cid)?.x)
                    .filter((x): x is number => x !== undefined)
                if (childXs.length === 0) continue

                const childMin = Math.min(...childXs)
                const childMax = Math.max(...childXs) + NODE_W
                const desiredMid = (childMin + childMax) / 2
                const unitW = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
                const newX = desiredMid - unitW / 2
                const y = pos.get(unit.primary)!.y
                const mid = newX + unitW / 2

                pos.set(unit.primary, { x: newX, y, mid })
                if (unit.spouse) {
                    pos.set(unit.spouse, { x: newX + NODE_W + COUPLE_GAP, y, mid })
                }
            }
        }
    }

    // ── Fix overlaps left-to-right within each generation ────────────────────
    for (let g = 0; g <= maxGen; g++) {
        const units = byGen.get(g) ?? []
        let minX = 40

        for (const unit of units) {
            const unitW = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
            const info = pos.get(unit.primary)!
            const x = Math.max(minX, info.x)
            const mid = x + unitW / 2

            pos.set(unit.primary, { ...info, x, mid })
            if (unit.spouse) {
                pos.set(unit.spouse, { ...info, x: x + NODE_W + COUPLE_GAP, mid })
            }
            minX = x + unitW + H_GAP
        }
    }

    return pos
}

// ── 6. Build ReactFlow nodes ──────────────────────────────────────────────────
// ── Bridge ID helper ──────────────────────────────────────────────────────────
const BRIDGE_ID = (primary: string, spouse: string) => `bridge-${primary}-${spouse}`

// ── 6. Build ReactFlow nodes ──────────────────────────────────────────────────

function makeNodes(
    people: PersonDetail[],
    pos: Map<string, PosInfo>,
    generations: Map<string, number>,
    parentToChildren: Map<string, Set<string>>,
    byGen: Map<number, CoupleUnit[]>,        // ← added
    selectedId: string | null,
    onNodeClick: (id: string) => void,
    treeId: number,
): Node[] {

    const hasParent = new Set<string>()
    for (const children of parentToChildren.values()) {
        for (const c of children) hasParent.add(c)
    }

    // ── Person nodes ──────────────────────────────────────────────────────────
    const personNodes: Node[] = people.map(person => {
        const info = pos.get(person.id) ?? { x: 0, y: 0, mid: 0 }
        const yearStr = (() => {
            const by = person.birthDate ? new Date(person.birthDate).getFullYear() : ''
            const dy = person.deathDate ? new Date(person.deathDate).getFullYear()
                : person.deathDate === null && person.birthDate ? '–' : ''
            return [by, dy].filter(Boolean).join(' ')
        })()
        return {
            id: String(person.id),
            type: 'familyMember',
            position: { x: info.x, y: info.y },
            data: {
                id: person.id,
                tree_id: treeId,
                name: person.fullName,
                gender: person.gender,
                isRoot: !hasParent.has(person.id),
                generation: generations.get(person.id) ?? 0,
                isSelected: person.id === selectedId,
                dates: yearStr,
                educationCount: (person.education ?? []).length,
                mediaCount: (person.media ?? []).length,
                onClick: onNodeClick,
            },
        }
    })

    // ── Bridge nodes — one invisible dot per couple, at exact midpoint ────────
    const bridgeNodes: Node[] = []
    for (const units of byGen.values()) {
        for (const unit of units) {
            if (!unit.spouse) continue
            const info = pos.get(unit.primary)
            if (!info) continue
            bridgeNodes.push({
                id: BRIDGE_ID(unit.primary, unit.spouse),
                type: 'bridgeNode',              // ← KEY CHANGE
                position: {
                    x: (pos.get(unit.primary)!.x + NODE_W + pos.get(unit.spouse)!.x) / 2,
                    y: info.y + NODE_H / 2,
                },
                style: {
                    width: 1,
                    height: 1,
                    background: 'transparent',
                    border: 'none',
                    pointerEvents: 'none' as any,
                },
                data: {},
                selectable: false,
                draggable: false,
                connectable: false,
            })
        }
    }

    return [...personNodes, ...bridgeNodes]
}

// ── 7. Build ReactFlow edges ──────────────────────────────────────────────────

function makeEdges(
    relations: RelationItem[],
    pos: Map<string, PosInfo>,
    byGen: Map<number, CoupleUnit[]>,
    parentToChildren: Map<string, Set<string>>,
): Edge[] {

    const edges = [] as Edge[]
    const seen = new Set<string>()

    const unitOf = new Map<string, CoupleUnit>()
    for (const units of byGen.values()) {
        for (const unit of units) {
            unitOf.set(unit.primary, unit)
            if (unit.spouse) unitOf.set(unit.spouse, unit)
        }
    }

    const bridgeIdOf = (personId: string): string | null => {
        const unit = unitOf.get(personId)
        if (!unit?.spouse) return null
        return BRIDGE_ID(unit.primary, unit.spouse)
    }

    // ── SPOUSE edges — split through bridge ───────────────────────────────────
    const processedSpouse = new Set<string>()
    for (const r of relations) {
        if (r.type !== 'SPOUSE_OF') continue
        const pairKey = [r.fromId, r.toId].sort().join('|')
        if (processedSpouse.has(pairKey)) continue
        processedSpouse.add(pairKey)

        const unit = unitOf.get(r.fromId) ?? unitOf.get(r.toId)
        if (!unit?.spouse) continue

        const bridgeId = BRIDGE_ID(unit.primary, unit.spouse)
        const spouseStyle = { stroke: '#d97706', strokeWidth: 2, opacity: 0.85 }

        // husband → bridge (with ⚭ label)
        edges.push({
            id: `spouse-left-${unit.primary}`,
            source: String(unit.primary),
            // no sourceHandle needed — FamilyMemberNode only has one source (bottom)
            // BUT we want horizontal line, so add RIGHT handle to FamilyMemberNode too (see Step 5)
            sourceHandle: 'right',
            target: bridgeId,
            targetHandle: 'left',            // ← pin to bridge LEFT
            type: 'straight',
            style: spouseStyle,
            label: '⚭',
            labelStyle: { fontSize: 11, fill: '#d97706' },
            labelBgStyle: { fill: 'transparent' },
            data: { relationType: 'SPOUSE_OF' },
        })

        // bridge → wife
        edges.push({
            id: `spouse-right-${unit.spouse}`,
            source: bridgeId,
            sourceHandle: 'right',           // ← pin to bridge RIGHT
            target: String(unit.spouse),
            targetHandle: 'left',            // ← arrives at wife's LEFT
            type: 'straight',
            style: spouseStyle,
            data: { relationType: 'SPOUSE_OF' },
        })
    }

    // ── PARENT_OF edges — source is bridge if parent is in a couple ───────────
    for (const r of relations) {
        if (r.type !== 'PARENT_OF') continue

        const key = [r.fromId, r.toId].sort().join('|') + ':parent'
        if (seen.has(key)) continue
        seen.add(key)

        let realParent: string, realChild: string
        if (parentToChildren.get(r.fromId)?.has(r.toId)) {
            realParent = r.fromId; realChild = r.toId
        } else if (parentToChildren.get(r.toId)?.has(r.fromId)) {
            realParent = r.toId; realChild = r.fromId
        } else {
            console.warn('[makeEdges] skipping orphaned PARENT_OF', r)
            continue
        }

        // ← KEY CHANGE: use bridge node as source so line drops from midpoint
        const sourceId = bridgeIdOf(realParent) ?? String(realParent)

        edges.push({
            id: `parent-${realParent}-${realChild}`,
            source: sourceId,
            sourceHandle: sourceId.startsWith('bridge-') ? 'bottom' : undefined, // ← bridge BOTTOM
            target: String(realChild),
            // no targetHandle — FamilyMemberNode's only target is top ✓
            type: 'smoothstep',
            style: { stroke: '#2563eb', strokeWidth: 1.5, opacity: 0.7 },
            markerEnd: { type: 'arrow' as any, width: 14, height: 14, color: '#2563eb' },
            data: { relationType: 'PARENT_OF' },
        })
    }

    // ── SIBLING edges (unchanged) ─────────────────────────────────────────────
    for (const r of relations) {
        if (r.type !== 'SIBLING_OF') continue
        const key = [r.fromId, r.toId].sort().join('|') + ':sibling'
        if (seen.has(key)) continue
        seen.add(key)
        edges.push({
            id: `sibling-${r.fromId}-${r.toId}`,
            source: String(r.fromId),
            target: String(r.toId),
            type: 'smoothstep',
            style: { stroke: '#059669', strokeWidth: 1, strokeDasharray: '3 4', opacity: 0.5 },
            data: { relationType: 'SIBLING_OF' },
        })
    }

    return edges
}

// ── Public entry point ────────────────────────────────────────────────────────

export function buildFamilyTreeGraph(
    people: PersonDetail[],
    relations: RelationItem[],
    selectedId: string | null,
    onNodeClick: (id: string) => void,
    treeId: number,
): { nodes: Node[]; edges: Edge[] } {
    if (people.length === 0) return { nodes: [], edges: [] }

    const personIds = people.map(p => p.id)
    const { parentToChildren, childToParents } = buildParentChildMap(relations)
    const spouseOf = buildSpouseMap(relations)
    const generations = assignGenerations(personIds, parentToChildren, childToParents, spouseOf)
    const byGen = buildCoupleUnits(personIds, generations, spouseOf, parentToChildren)
    const pos = computePositions(byGen)

    // ← byGen now passed to makeNodes for bridge node creation
    const nodes = makeNodes(people, pos, generations, parentToChildren, byGen, selectedId, onNodeClick, treeId)
    const edges = makeEdges(relations, pos, byGen, parentToChildren)

    return { nodes, edges }
}