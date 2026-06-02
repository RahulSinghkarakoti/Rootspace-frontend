import { create } from 'zustand'
import { treesApi } from '@/api/treesApi'
import type { EducationItem, MediaItem, PersonDetail,SharedTreeItem, RelationItem, CollaboationItem } from '@/types/familyTree'
import type { CreateTreePayload, TreeSummary } from '@/types'
import { personApi } from '@/api/personApi'

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
  cacheDurationMs: 60 * 1000,
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
    set({ isLoading: true, error: null })
    try {
      const response = await treesApi.getAll()
      set({ trees: response.data.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load trees',
      })
    } finally {
      set({ isLoading: false })
    }
  },
  createTree: async (payload) => {
    set({ error: null, creatingTree: true })
    try {
      const response = await treesApi.create(payload)
      const newTree = response.data.data
      set((state) => ({ trees: [...state.trees, newTree] }))
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
      isLoading: false,
      error: null,
    }),

  loadCurrentTree: async (treeId, force = false) => {
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
      })
    } catch (error) {
      console.error(error)
      set({
        error: error instanceof Error ? error.message : 'Unable to load tree data',
      })
    } finally {
      set({ isLoading: false })
    }
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
    set({ isLoading: true, error: null })

    try {
      const response = await treesApi.getTreeMedia(treeId)
      set({ treeMedia: response.data.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load tree media',
      })
    } finally {
      set({ isLoading: false })
    }
  },

  loadPersonEducation: async (personId) => {
    set({ isLoading: true, error: null })

    try {
      const response = await treesApi.getPersonEducation(personId)
      set((state) => ({
        selectedPersonEducation: {
          ...state.selectedPersonEducation,
          [personId]: response.data.data,
        },
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load education details',
      })
    } finally {
      set({ isLoading: false })
    }
  },
  loadCollaborations: async () => {
    set({ gettinCollaborations: true, error: null })
    try {
      const response = await treesApi.getCollaborations()
      set({ collaborations: response.data.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load collaborations',
      })
    } finally {
      set({ gettinCollaborations: false })
    }
  },
  loadSharedTrees: async () => {
    set({ gettingSharedTrees: true, error: null })
    try {
      const response = await treesApi.getAllSharedTree()
      set({ sharedTrees: response.data.data })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load shared trees',
      })
    } finally {      set({ gettingSharedTrees: false })
    } },
}))
