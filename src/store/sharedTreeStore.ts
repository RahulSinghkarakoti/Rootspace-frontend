import { create } from 'zustand'
import { treesApi } from '@/api/treesApi'
import type { MediaItem, PersonDetail, RelationItem, SharedTreeAccess } from '@/types/familyTree'
import type { TreeSummary } from '@/types'

const SHARED_TREE_CACHE_DURATION_MS = 60 * 1000
const pendingSharedTreeLoads = new Map<string, Promise<void>>()

export interface TreeStoreState {
    verifyingTree: boolean
    isLoading: boolean
    token: string | null
    loadedAt: number | null
    access: SharedTreeAccess | null
    treeData: TreeSummary | null
    relations: RelationItem[]
    people: PersonDetail[]
    media: MediaItem[]
    error: string | null
    verifyAndLoad: (token: string) => Promise<void>
    upsertPerson: (person: PersonDetail) => void
    addPerson: (person: PersonDetail) => void
    addRelations: (relations: RelationItem[]) => void
    removePerson: (personId: string, decrementAddedCount?: boolean) => void
    clear: () => void
}

export const useSharedTreeStore = create<TreeStoreState>((set, get) => ({
    verifyingTree: false,
    isLoading: false,
    token: null,
    loadedAt: null,
    access: null,
    treeData: null,
    relations: [],
    people: [],
    media: [],
    error: null,

    verifyAndLoad: async (token) => {
        const state = get()
        const cacheIsFresh =
            state.token === token &&
            state.loadedAt !== null &&
            Date.now() - state.loadedAt < SHARED_TREE_CACHE_DURATION_MS

        if (cacheIsFresh) return
        if (pendingSharedTreeLoads.has(token)) return pendingSharedTreeLoads.get(token)

        const pending = (async () => {
            set({ verifyingTree: true, isLoading: true, error: null })
            try {
                const response = await treesApi.getSharedTree(token)
                const data = response.data.data
                set({
                    token,
                    loadedAt: Date.now(),
                    access: {
                        token: data.token,
                        tree: data.tree,
                        permission: data.permission,
                        rights: data.rights,
                        personLimit: data.personLimit,
                        expiresAt: data.expiresAt,
                        member: data.member,
                    },
                    treeData: data.tree,
                    people: data.people.map((person) => ({
                        ...person,
                        education: person.education ?? [],
                        media: person.media ?? [],
                    })),
                    relations: data.relations,
                    media: data.media,
                })
            } catch (error) {
                set({
                    error: error instanceof Error ? error.message : 'Unable to open shared tree',
                })
            } finally {
                set({ verifyingTree: false, isLoading: false })
                pendingSharedTreeLoads.delete(token)
            }
        })()

        pendingSharedTreeLoads.set(token, pending)
        return pending
    },
    upsertPerson: (person) =>
        set((state) => ({
            people: state.people.some((item) => item.id === person.id)
                ? state.people.map((item) => item.id === person.id
                    ? { ...person, education: person.education ?? [], media: person.media ?? [] }
                    : item)
                : [...state.people, { ...person, education: person.education ?? [], media: person.media ?? [] }],
        })),
    addPerson: (person) =>
        set((state) => ({
            people: state.people.some((item) => item.id === person.id)
                ? state.people
                : [...state.people, { ...person, education: person.education ?? [], media: person.media ?? [] }],
            treeData: state.treeData
                ? {
                    ...state.treeData,
                    _count: {
                        ...state.treeData._count,
                        persons: state.treeData._count.persons + 1,
                    },
                }
                : state.treeData,
            access: state.access
                ? {
                    ...state.access,
                    member: state.access.member
                        ? {
                            ...state.access.member,
                            addedPersonsCount: (state.access.member.addedPersonsCount ?? 0) + 1,
                        }
                        : state.access.member,
                }
                : state.access,
        })),
    addRelations: (relations) =>
        set((state) => {
            const existingKeys = new Set(
                state.relations.map((relation) =>
                    relation.type === 'SPOUSE_OF'
                        ? [...[relation.fromId, relation.toId].sort(), relation.type].join('|')
                        : `${relation.fromId}|${relation.toId}|${relation.type}`
                )
            )
            const next = relations.filter((relation) => {
                const key = relation.type === 'SPOUSE_OF'
                    ? [...[relation.fromId, relation.toId].sort(), relation.type].join('|')
                    : `${relation.fromId}|${relation.toId}|${relation.type}`
                if (existingKeys.has(key)) return false
                existingKeys.add(key)
                return true
            })
            return { relations: [...state.relations, ...next] }
        }),
    removePerson: (personId, decrementAddedCount = false) =>
        set((state) => ({
            people: state.people.filter((person) => person.id !== personId),
            relations: state.relations.filter(
                (relation) => relation.fromId !== personId && relation.toId !== personId
            ),
            treeData: state.treeData
                ? {
                    ...state.treeData,
                    _count: {
                        ...state.treeData._count,
                        persons: Math.max(0, state.treeData._count.persons - 1),
                    },
                }
                : state.treeData,
            access: state.access && decrementAddedCount && state.access.member
                ? {
                    ...state.access,
                    member: {
                        ...state.access.member,
                        addedPersonsCount: Math.max(0, (state.access.member.addedPersonsCount ?? 0) - 1),
                    },
                }
                : state.access,
        })),
    clear: () => set({ token: null, loadedAt: null, access: null, treeData: null, people: [], relations: [], media: [], error: null }),
}))
