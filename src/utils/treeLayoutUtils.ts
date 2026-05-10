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

const NODE_W = 64
const NODE_H = 100
const H_GAP = 100
const COUPLE_GAP = 100
const V_GAP = 120

// ── Types ─────────────────────────────────────────────────────────────────────

interface CoupleUnit {
    primary: string
    spouse?: string
    children: string[]       // union of both partners' children
}

interface PosInfo {
    x: number
    y: number
}

// ── Step 1: Build parent↔child maps ──────────────────────────────────────────

function buildParentChildMap(relations: RelationItem[]) {
    const parentToChildren = new Map<string, Set<string>>()
    const childToParents = new Map<string, Set<string>>()

    for (const r of relations) {
        if (r.type !== 'PARENT_OF') continue
        const { fromId: p, toId: c } = r
        if (p === c) continue

        // Cycle guard
        const visited = new Set<string>()
        const q = [c]
        let cycle = false
        while (q.length) {
            const cur = q.shift()!
            if (cur === p) { cycle = true; break }
            if (visited.has(cur)) continue
            visited.add(cur)
            for (const ch of parentToChildren.get(cur) ?? []) q.push(ch)
        }
        if (cycle) { console.warn('[layout] cycle skipped', r); continue }

        if (!parentToChildren.has(p)) parentToChildren.set(p, new Set())
        if (!childToParents.has(c)) childToParents.set(c, new Set())
        parentToChildren.get(p)!.add(c)
        childToParents.get(c)!.add(p)
    }

    return { parentToChildren, childToParents }
}

// ── Step 2: Build spouse map ──────────────────────────────────────────────────

function buildSpouseMap(relations: RelationItem[]): Map<string, string> {
    const spouseOf = new Map<string, string>()
    const seenPairs = new Set<string>()

    for (const r of relations) {
        if (r.type !== 'SPOUSE_OF') continue
        const key = [r.fromId, r.toId].sort().join('|')
        if (seenPairs.has(key)) continue
        seenPairs.add(key)
        spouseOf.set(r.fromId, r.toId)
        spouseOf.set(r.toId, r.fromId)
    }

    return spouseOf
}

// ── Step 3: Assign depth via topological sort ─────────────────────────────────
// Pure BFS from roots downward. No generation concept — just "depth".
// Then: for every spouse pair, level them to max(depthA, depthB).
// Then: re-run upward pass so parents always sit exactly 1 above their deepest child.

function assignDepths(
    personIds: string[],
    parentToChildren: Map<string, Set<string>>,
    childToParents: Map<string, Set<string>>,
    spouseOf: Map<string, string>,
): Map<string, number> {

    const depth = new Map<string, number>()

    // ── Roots: no parents ────────────────────────────────────────────────────
    const roots = personIds.filter(
        id => !childToParents.has(id) || childToParents.get(id)!.size === 0
    )
    const startRoots = roots.length > 0
        ? roots
        : [personIds.reduce((a, b) =>
            (parentToChildren.get(a)?.size ?? 0) >= (parentToChildren.get(b)?.size ?? 0) ? a : b
        )]

    // ── Downward BFS ─────────────────────────────────────────────────────────
    const q: string[] = []
    for (const id of startRoots) { depth.set(id, 0); q.push(id) }

    while (q.length > 0) {
        const pid = q.shift()!
        const pd = depth.get(pid)!
        for (const cid of parentToChildren.get(pid) ?? []) {
            const proposed = pd + 1
            if ((depth.get(cid) ?? -1) < proposed) {
                depth.set(cid, proposed)
                q.push(cid)
            }
        }
    }

    // ── Fill any disconnected nodes ───────────────────────────────────────────
    for (const id of personIds) {
        if (!depth.has(id)) depth.set(id, 0)
    }

    // ── Spouse alignment: both partners at same depth ────────────────────────
    const processedPairs = new Set<string>()
    for (const [a, b] of spouseOf) {
        const key = [a, b].sort().join('|')
        if (processedPairs.has(key)) continue
        processedPairs.add(key)
        const da = depth.get(a) ?? 0
        const db = depth.get(b) ?? 0
        const maxD = Math.max(da, db)
        depth.set(a, maxD)
        depth.set(b, maxD)
    }

    // ── Upward pass: parents must be exactly 1 above their deepest child ─────
    // Run multiple passes until stable (handles chains)
    let changed = true
    let safetyCounter = 0
    while (changed && safetyCounter < 100) {
        changed = false
        safetyCounter++
        for (const id of personIds) {
            const children = [...(parentToChildren.get(id) ?? [])]
            if (children.length === 0) continue
            const maxChildDepth = Math.max(...children.map(c => depth.get(c) ?? 0))
            const required = maxChildDepth - 1
            const current = depth.get(id) ?? 0
            if (required > current) {
                depth.set(id, required)
                changed = true
            }
        }
        // Re-align spouses after each upward pass
        const pp2 = new Set<string>()
        for (const [a, b] of spouseOf) {
            const key = [a, b].sort().join('|')
            if (pp2.has(key)) continue
            pp2.add(key)
            const da = depth.get(a) ?? 0
            const db = depth.get(b) ?? 0
            const maxD = Math.max(da, db)
            if (da !== maxD || db !== maxD) {
                depth.set(a, maxD)
                depth.set(b, maxD)
                changed = true
            }
        }
    }

    // ── Normalize so minimum depth = 0 ───────────────────────────────────────
    const minDepth = Math.min(...depth.values())
    if (minDepth !== 0) {
        for (const [id, d] of depth) depth.set(id, d - minDepth)
    }

    return depth
}

function sharesAncestor(
    groupA: string[],
    groupB: string[],
    childToParents: Map<string, Set<string>>,
): boolean {
    const getAncestors = (ids: string[]): Set<string> => {
        const visited = new Set<string>()
        const q = [...ids]
        while (q.length) {
            const id = q.shift()!
            if (visited.has(id)) continue
            visited.add(id)
            for (const p of childToParents.get(id) ?? []) q.push(p)
        }
        return visited
    }
    const ancestorsA = getAncestors(groupA)
    for (const id of getAncestors(groupB)) {
        if (ancestorsA.has(id)) return true
    }
    return false
}
// ── Step 4: Group into couple units per depth level ───────────────────────────

function buildCoupleUnits(
    personIds: string[],
    depths: Map<string, number>,
    spouseOf: Map<string, string>,
    parentToChildren: Map<string, Set<string>>,
): Map<number, CoupleUnit[]> {

    const assigned = new Set<string>()
    const byDepth = new Map<number, CoupleUnit[]>()
    const maxDepth = Math.max(...depths.values(), 0)

    for (let d = 0; d <= maxDepth; d++) {
        const units: CoupleUnit[] = []
        const atThisDepth = personIds.filter(id => (depths.get(id) ?? 0) === d)

        for (const id of atThisDepth) {
            if (assigned.has(id)) continue
            assigned.add(id)

            const spouse = spouseOf.get(id)
            const unit: CoupleUnit = { primary: id, children: [] }

            if (spouse && !assigned.has(spouse) && (depths.get(spouse) ?? -1) === d) {
                assigned.add(spouse)
                unit.spouse = spouse
            }

            const childSet = new Set([
                ...(parentToChildren.get(id) ?? []),
                ...(unit.spouse ? parentToChildren.get(unit.spouse) ?? [] : []),
            ])
            unit.children = [...childSet]
            units.push(unit)
        }

        byDepth.set(d, units)
    }

    return byDepth
}

// ── Step 5: Compute X/Y positions ─────────────────────────────────────────────

function computePositions(
    byDepth: Map<number, CoupleUnit[]>,
    childToParents: Map<string, Set<string>>,
): Map<string, PosInfo> {
    const pos = new Map<string, PosInfo>()
    const maxDepth = Math.max(...byDepth.keys(), 0)
 
    // ── Initial left-to-right placement ──────────────────────────────────────
    for (let d = 0; d <= maxDepth; d++) {
        const units = byDepth.get(d) ?? []
        const y = d * (NODE_H + V_GAP) + 40
        let cursor = 40
 
        for (const unit of units) {
            const unitW = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
            pos.set(unit.primary, { x: cursor, y })
            if (unit.spouse) {
                pos.set(unit.spouse, { x: cursor + NODE_W + COUPLE_GAP, y })
            }
            cursor += unitW + H_GAP
        }
    }
 
    // ── FIX 1: Centre children under their parent couple (top-down pass) ─────
    // Run top-down first so children are placed relative to their already-
    // positioned parents before we do the bottom-up re-centering of parents.
    for (let _pass = 0; _pass < 3; _pass++) {
        for (let d = 0; d < maxDepth; d++) {
            const units = byDepth.get(d) ?? []
            for (const unit of units) {
                if (unit.children.length === 0) continue
 
                // Midpoint of this couple unit
                const pPos = pos.get(unit.primary)!
                const coupleW = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
                const coupleMid = pPos.x + coupleW / 2
 
                // Current span of children
                const childXs = unit.children
                    .map(cid => pos.get(cid)?.x)
                    .filter((x): x is number => x !== undefined)
                if (childXs.length === 0) continue
 
                const childSpan = (Math.max(...childXs) + NODE_W) - Math.min(...childXs)
                const desiredChildLeft = coupleMid - childSpan / 2
                const currentChildLeft = Math.min(...childXs)
                const shift = desiredChildLeft - currentChildLeft
 
                if (Math.abs(shift) < 1) continue
 
                // Shift all children together
                for (const cid of unit.children) {
                    const cp = pos.get(cid)
                    if (cp) pos.set(cid, { x: cp.x + shift, y: cp.y })
                }
            }
        }
 
        // ── Centre parents over their children (bottom-up pass) ──────────────
        for (let d = maxDepth - 1; d >= 0; d--) {
            const units = byDepth.get(d) ?? []
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
 
                pos.set(unit.primary, { x: newX, y })
                if (unit.spouse) {
                    pos.set(unit.spouse, { x: newX + NODE_W + COUPLE_GAP, y })
                }
            }
        }
    }
 
    // ── Fix overlaps with clan-aware spacing ──────────────────────────────────
    for (let d = 0; d <= maxDepth; d++) {
        const units = byDepth.get(d) ?? []
        let minX = 40
        for (let i = 0; i < units.length; i++) {
            const unit     = units[i]
            const prevUnit = units[i - 1]
            const unitW    = unit.spouse ? NODE_W * 2 + COUPLE_GAP : NODE_W
 
            const isNewClan = prevUnit ? !sharesAncestor(
                [unit.primary, unit.spouse].filter(Boolean) as string[],
                [prevUnit.primary, prevUnit.spouse].filter(Boolean) as string[],
                childToParents
            ) : false
 
            const gap  = isNewClan ? H_GAP * 4 : H_GAP
            const info = pos.get(unit.primary)!
            const x    = Math.max(minX, info.x)
            const y    = info.y
 
            pos.set(unit.primary, { x, y })
            if (unit.spouse) {
                pos.set(unit.spouse, { x: x + NODE_W + COUPLE_GAP, y })
            }
            minX = x + unitW + gap
        }
    }
 
    return pos
}
 

// ── Step 6: Bridge node helpers ───────────────────────────────────────────────

const BRIDGE_ID = (primary: string, spouse: string) => `bridge-${primary}-${spouse}`

// ── Step 7: Build ReactFlow nodes ─────────────────────────────────────────────

function makeNodes(
    people: PersonDetail[],
    pos: Map<string, PosInfo>,
    depths: Map<string, number>,
    parentToChildren: Map<string, Set<string>>,
    byDepth: Map<number, CoupleUnit[]>,
    selectedId: string | null,
    onNodeClick: (id: string, showInfo: boolean) => void,
    treeId: number,
    relations: RelationItem[]
): Node[] {

    const hasParent = new Set<string>()
    for (const children of parentToChildren.values()) {
        for (const c of children) hasParent.add(c)
    }

    // Person nodes
    const personNodes: Node[] = people.map(person => {
        const info = pos.get(person.id) ?? { x: 0, y: 0 }
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
                generation: depths.get(person.id) ?? 0,
                isSelected: person.id === selectedId,
                dates: yearStr,
                educationCount: (person.education ?? []).length,
                mediaCount: (person.media ?? []).length,
                onClick: onNodeClick,
            },
        }
    })

    // Bridge nodes (invisible midpoint between spouses)
    const bridgeNodes: Node[] = []
    for (const units of byDepth.values()) {
        for (const unit of units) {
            if (!unit.spouse) continue
            const pPos = pos.get(unit.primary)
            const sPos = pos.get(unit.spouse)
            if (!pPos || !sPos) continue

            bridgeNodes.push({
                id: BRIDGE_ID(unit.primary, unit.spouse),
                type: 'bridgeNode',
                position: {
                    x: (pPos.x + NODE_W + sPos.x) / 2,
                    y: pPos.y + NODE_H / 2,
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

// ── Step 8: Build ReactFlow edges ─────────────────────────────────────────────

function makeEdges(
    relations: RelationItem[],
    byDepth: Map<number, CoupleUnit[]>,
    parentToChildren: Map<string, Set<string>>,
    pos: Map<string, PosInfo>,
): Edge[] {

    const edges = [] as Edge[]
    const seen = new Set<string>()

    // Map every person → their couple unit
    const unitOf = new Map<string, CoupleUnit>()
    for (const units of byDepth.values()) {
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

    // Spouse edges (split through bridge)
    const processedSpouse = new Set<string>()
    for (const r of relations) {
        if (r.type !== 'SPOUSE_OF') continue
        const pairKey = [r.fromId, r.toId].sort().join('|')
        if (processedSpouse.has(pairKey)) continue
        processedSpouse.add(pairKey)

        // Always source from the left person (smaller X) → target right person
        const fromX = pos.get(r.fromId)?.x ?? 0
        const toX = pos.get(r.toId)?.x ?? 0
        const leftId = fromX <= toX ? r.fromId : r.toId
        const rightId = fromX <= toX ? r.toId : r.fromId

        edges.push({
            id: `spouse-${pairKey}`,
            source: String(leftId),
            sourceHandle: 'right',
            target: String(rightId),
            targetHandle: 'left',
            type: 'straight',
            style: { stroke: '#d97706', strokeWidth: 2, opacity: 0.85 },
            data: { relationType: 'SPOUSE_OF' },
        })
    }

    // Parent→child edges (sourced from bridge if parent is in a couple)
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
            continue
        }

        edges.push({
            id: `parent-${realParent}-${realChild}`,
            source: String(realParent),  // ← use actual parent, not unit primary
            sourceHandle: 'bottom',      // ← always bottom
            target: String(realChild),
            targetHandle: 'top',         // ← always top
            type: 'smoothstep',
            style: { stroke: '#2563eb', strokeWidth: 1.5, opacity: 0.7 },
            markerEnd: { type: 'arrow' as any, width: 14, height: 14, color: '#2563eb' },
            data: { relationType: 'PARENT_OF' },
        })
    }

    // Sibling edges
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
    onNodeClick: (id: string, showInfo: boolean) => void,
    treeId: number,
): { nodes: Node[]; edges: Edge[] } {
    if (people.length === 0) return { nodes: [], edges: [] }

    const personIds = people.map(p => p.id)
    const { parentToChildren, childToParents } = buildParentChildMap(relations)
    const spouseOf = buildSpouseMap(relations)
    const depths = assignDepths(personIds, parentToChildren, childToParents, spouseOf)
    const byDepth = buildCoupleUnits(personIds, depths, spouseOf, parentToChildren)
    const pos = computePositions(byDepth,childToParents)
    const nodes = makeNodes(people, pos, depths, parentToChildren, byDepth, selectedId, onNodeClick, treeId,relations)
    const edges = makeEdges(relations, byDepth, parentToChildren, pos)

    return { nodes, edges }
}