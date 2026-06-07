import { create } from 'zustand'
import { treesApi } from '@/api/treesApi'
import type { EducationItem, MediaItem, PersonDetail,SharedTreeItem, RelationItem, CollaboationItem } from '@/types/familyTree'
import type { CreateTreePayload, TreeSummary } from '@/types'
import { personApi } from '@/api/personApi'

const DEFAULT_CACHE_DURATION_MS = 60 * 1000

let pendingAllTrees: Promise<void> | null = null
const pendingTreeLoads = new Map<number, Promise<void>>()
const pendingTreeMediaLoads = new Map<number, Promise<void>>()
const pendingEducationLoads = new Map<string, Promise<void>>()
let pendingCollaborations: Promise<void> | null = null
let pendingSharedTrees: Promise<void> | null = null

export interface TreeStoreState {
  treesLoaded: boolean
  deletingTree: boolean
  creatingTree: boolean
  trees: TreeSummary[]
  currentTreeId: number | null
  currentTree: TreeSummary | null
  people: PersonDetail[]
  relations: RelationItem[]
  treeMedia: MediaItem[]
  selectedPersonEducation: Record<string, EducationItem[]>
  lastLoadedAt: number | null
  treesLoadedAt: number | null
  currentTreeLoadedAt: number | null
  treeMediaLoadedAt: Record<number, number>
  selectedPersonEducationLoadedAt: Record<string, number>
  collaborationsLoadedAt: number | null
  sharedTreesLoadedAt: number | null
  cacheDurationMs: number
  isLoading: boolean
  error: string | null

  gettinCollaborations: boolean
  gettingSharedTrees: boolean
  setGettingCollaborations: (loading: boolean) => void
  collaborations: CollaboationItem[]
loadCollaborations: () => Promise<void>
sharedTrees: SharedTreeItem[]
loadSharedTrees: () => Promise<void>
setSharedTreeActive: (token: string, isActive: boolean) => void
  setTreeLoaded: (loaded: boolean) => void
  setTrees: (trees: TreeSummary[]) => void
  createTree: (payload: CreateTreePayload) => Promise<TreeSummary>
  deleteTree: (treeId: number) => Promise<void>
  setCurrentTreeId: (treeId: number | null) => void
  setCurrentTree: (tree: TreeSummary | null) => void
  setPeople: (people: PersonDetail[]) => void
  setRelations: (relations: RelationItem[]) => void
  upsertPerson: (person: PersonDetail) => void
  addPerson: (person: PersonDetail) => void
  addRelations: (relations: RelationItem[]) => void
  setTreeMedia: (media: MediaItem[]) => void
  setError: (error: string | null) => void
  clearTree: () => void
  loadAllTrees: () => Promise<void>
  loadCurrentTree: (treeId: number, force?: boolean) => Promise<void>
  deleteNode: (personId: string) => Promise<void>
  loadTreeMedia: (treeId: number) => Promise<void>
  loadPersonEducation: (personId: string) => Promise<void>
}

export const useTreeStore = create<TreeStoreState>((set, get) => ({
  creatingTree: false,
  deletingTree: false,
  trees: [],
  treesLoaded: false,
  currentTreeId: null,
  currentTree: null,
  people: [],
  relations: [],
  treeMedia: [],
  selectedPersonEducation: {},
  lastLoadedAt: null,
  treesLoadedAt: null,
  currentTreeLoadedAt: null,
  treeMediaLoadedAt: {},
  selectedPersonEducationLoadedAt: {},
  collaborationsLoadedAt: null,
  sharedTreesLoadedAt: null,
  cacheDurationMs: DEFAULT_CACHE_DURATION_MS,
  isLoading: false,
  error: null,
  gettinCollaborations: false,
  gettingSharedTrees: false,
  setGettingCollaborations: (loading) => set({ gettinCollaborations: loading }),
  collaborations: [],
sharedTrees: [],
  setTrees: (trees) => set({ trees }),
  setTreeLoaded: () => set({ treesLoaded: true }),
  setCurrentTreeId: (treeId) => set({ currentTreeId: treeId }),
  setCurrentTree: (currentTree) => set({ currentTree }),
  setPeople: (people) => set({ people }),
  setRelations: (relations) => set({ relations }),
  upsertPerson: (person) =>
    set((state) => ({
      people: state.people.some((item) => item.id === person.id)
        ? state.people.map((item) => item.id === person.id ? person : item)
        : [...state.people, person],
    })),
  addPerson: (person) =>
    set((state) => ({
      people: state.people.some((item) => item.id === person.id)
        ? state.people
        : [...state.people, person],
      currentTree: state.currentTree
        ? {
          ...state.currentTree,
          _count: {
            ...state.currentTree._count,
            persons: state.currentTree._count.persons + 1,
          },
        }
        : state.currentTree,
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

      const newRelations = relations.filter((relation) => {
        const key = relation.type === 'SPOUSE_OF'
          ? [...[relation.fromId, relation.toId].sort(), relation.type].join('|')
          : `${relation.fromId}|${relation.toId}|${relation.type}`

        if (existingKeys.has(key)) return false
        existingKeys.add(key)
        return true
      })

      return { relations: [...state.relations, ...newRelations] }
    }),
  setTreeMedia: (treeMedia) => set({ treeMedia }),
  setError: (error) => set({ error }),
  setSharedTreeActive: (token, isActive) =>
    set((state) => ({
      sharedTrees: state.sharedTrees.map((share) =>
        share.token === token ? { ...share, isActive } : share
      ),
    })),


  loadAllTrees: async () => {
    const state = get()
    const cacheIsFresh =
      state.treesLoaded &&
      state.treesLoadedAt !== null &&
      Date.now() - state.treesLoadedAt < state.cacheDurationMs

    if (cacheIsFresh) return
    if (pendingAllTrees) return pendingAllTrees

    pendingAllTrees = (async () => {
      set({ isLoading: true, error: null })
      try {
        const response = await treesApi.getAll()
        set({ trees: response.data.data, treesLoaded: true, treesLoadedAt: Date.now() })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unable to load trees',
        })
      } finally {
        set({ isLoading: false })
        pendingAllTrees = null
      }
    })()

    return pendingAllTrees
  },
  createTree: async (payload) => {
    set({ error: null, creatingTree: true })
    try {
      const response = await treesApi.create(payload)
      const newTree = response.data.data
      set((state) => ({ trees: [...state.trees, newTree], treesLoadedAt: Date.now() }))
      return newTree
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to create tree'
      set({ error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      set({ creatingTree: false })
    }
  },
  deleteTree: async (treeId) => {
    set({ error: null, deletingTree: true })
    try {
      await treesApi.delete(treeId.toString())
      set((state) => ({
        trees: state.trees.filter((tree) => tree.id !== treeId),
        currentTreeId: state.currentTreeId === treeId ? null : state.currentTreeId,
        currentTree: state.currentTreeId === treeId ? null : state.currentTree,
        people: state.currentTreeId === treeId ? [] : state.people,
        relations: state.currentTreeId === treeId ? [] : state.relations,
        treeMedia: state.currentTreeId === treeId ? [] : state.treeMedia,
        selectedPersonEducation: state.currentTreeId === treeId ? {} : state.selectedPersonEducation,
        treesLoadedAt: Date.now(),
        currentTreeLoadedAt: state.currentTreeId === treeId ? null : state.currentTreeLoadedAt,
      }))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to delete tree'
      set({ error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      set({ deletingTree: false })
    }
  },
  clearTree: () =>
    set({
      currentTreeId: null,
      currentTree: null,
      people: [],
      relations: [],
      treeMedia: [],
      selectedPersonEducation: {},
      currentTreeLoadedAt: null,
      treeMediaLoadedAt: {},
      selectedPersonEducationLoadedAt: {},
      isLoading: false,
      error: null,
    }),

  loadCurrentTree: async (treeId, force = false) => {
    const state = get()
    const cacheIsFresh =
      !force &&
      state.currentTreeId === treeId &&
      state.currentTree !== null &&
      state.currentTreeLoadedAt !== null &&
      Date.now() - state.currentTreeLoadedAt < state.cacheDurationMs

    if (cacheIsFresh) return
    if (!force && pendingTreeLoads.has(treeId)) return pendingTreeLoads.get(treeId)

    const pending = (async () => {
      set({ isLoading: true, error: null, currentTreeId: treeId })
      try {
        const [treeResponse, peopleResponse, relationsResponse] = await Promise.all([
          treesApi.getOne(String(treeId)),
          treesApi.getAllTreePerson(treeId),
          treesApi.getTreeRelations(treeId),
        ])

        set({
          currentTree: treeResponse.data.data,
          people: peopleResponse.data.data.map((person) => ({
            ...person,
            education: person.education ?? [],
            media: person.media ?? [],
          })),
          relations: relationsResponse.data.data,
          currentTreeLoadedAt: Date.now(),
          lastLoadedAt: Date.now(),
        })
      } catch (error) {
        console.error(error)
        set({
          error: error instanceof Error ? error.message : 'Unable to load tree data',
        })
      } finally {
        set({ isLoading: false })
        pendingTreeLoads.delete(treeId)
      }
    })()

    pendingTreeLoads.set(treeId, pending)
    return pending
  },

  deleteNode: async (personId) => {
    // set({ isLoading: true, error: null })
    try {
      await personApi.deletePerson(personId)
      set((state) => ({
        people: state.people.filter((person) => person.id !== personId),
        relations: state.relations.filter(
          (relation) => relation.fromId !== personId && relation.toId !== personId
        ),
        selectedPersonEducation: Object.fromEntries(
          Object.entries(state.selectedPersonEducation).filter(([id]) => id !== personId)
        ),
        currentTree: state.currentTree
          ? {
            ...state.currentTree,
            _count: {
              ...state.currentTree._count,
              persons: Math.max(0, state.currentTree._count.persons - 1),
            },
          }
          : state.currentTree,
        currentTreeLoadedAt: Date.now(),
      }))
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : 'Unable to delete person'
      set({ error: errorMessage })
      throw new Error(errorMessage)
    } finally {
      // set({ isLoading: false })
    }
  },


  loadTreeMedia: async (treeId) => {
    const state = get()
    const cacheIsFresh =
      state.treeMediaLoadedAt[treeId] !== undefined &&
      Date.now() - state.treeMediaLoadedAt[treeId] < state.cacheDurationMs

    if (cacheIsFresh) return
    if (pendingTreeMediaLoads.has(treeId)) return pendingTreeMediaLoads.get(treeId)

    const pending = (async () => {
      set({ isLoading: true, error: null })

      try {
        const response = await treesApi.getTreeMedia(treeId)
        set((state) => ({
          treeMedia: response.data.data,
          treeMediaLoadedAt: { ...state.treeMediaLoadedAt, [treeId]: Date.now() },
        }))
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unable to load tree media',
        })
      } finally {
        set({ isLoading: false })
        pendingTreeMediaLoads.delete(treeId)
      }
    })()

    pendingTreeMediaLoads.set(treeId, pending)
    return pending
  },

  loadPersonEducation: async (personId) => {
    const state = get()
    const cacheIsFresh =
      state.selectedPersonEducation[personId] !== undefined &&
      state.selectedPersonEducationLoadedAt[personId] !== undefined &&
      Date.now() - state.selectedPersonEducationLoadedAt[personId] < state.cacheDurationMs

    if (cacheIsFresh) return
    if (pendingEducationLoads.has(personId)) return pendingEducationLoads.get(personId)

    const pending = (async () => {
      set({ isLoading: true, error: null })

      try {
        const response = await treesApi.getPersonEducation(personId)
        set((state) => ({
          selectedPersonEducation: {
            ...state.selectedPersonEducation,
            [personId]: response.data.data,
          },
          selectedPersonEducationLoadedAt: {
            ...state.selectedPersonEducationLoadedAt,
            [personId]: Date.now(),
          },
        }))
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unable to load education details',
        })
      } finally {
        set({ isLoading: false })
        pendingEducationLoads.delete(personId)
      }
    })()

    pendingEducationLoads.set(personId, pending)
    return pending
  },
  loadCollaborations: async () => {
    const state = get()
    const cacheIsFresh =
      state.collaborationsLoadedAt !== null &&
      Date.now() - state.collaborationsLoadedAt < state.cacheDurationMs

    if (cacheIsFresh) return
    if (pendingCollaborations) return pendingCollaborations

    pendingCollaborations = (async () => {
      set({ gettinCollaborations: true, error: null })
      try {
        const response = await treesApi.getCollaborations()
        set({ collaborations: response.data.data, collaborationsLoadedAt: Date.now() })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unable to load collaborations',
        })
      } finally {
        set({ gettinCollaborations: false })
        pendingCollaborations = null
      }
    })()

    return pendingCollaborations
  },
  loadSharedTrees: async () => {
    const state = get()
    const cacheIsFresh =
      state.sharedTreesLoadedAt !== null &&
      Date.now() - state.sharedTreesLoadedAt < state.cacheDurationMs

    if (cacheIsFresh) return
    if (pendingSharedTrees) return pendingSharedTrees

    pendingSharedTrees = (async () => {
      set({ gettingSharedTrees: true, error: null })
      try {
        const response = await treesApi.getAllSharedTree()
        set({ sharedTrees: response.data.data, sharedTreesLoadedAt: Date.now() })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : 'Unable to load shared trees',
        })
      } finally {
        set({ gettingSharedTrees: false })
        pendingSharedTrees = null
      }
    })()

    return pendingSharedTrees
  },
}))
