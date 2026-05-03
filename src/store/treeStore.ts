import { create } from 'zustand'
import { treesApi } from '@/api/treesApi'
import type { EducationItem, MediaItem, PersonDetail, RelationItem } from '@/types/familyTree'
import type { TreeSummary } from '@/types'
import { personApi } from '@/api/personApi'

export interface TreeStoreState {
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

  setCurrentTreeId: (treeId: number | null) => void
  setCurrentTree: (tree: TreeSummary | null) => void
  setPeople: (people: PersonDetail[]) => void
  setRelations: (relations: RelationItem[]) => void
  setTreeMedia: (media: MediaItem[]) => void
  setError: (error: string | null) => void
  clearTree: () => void
  loadCurrentTree: (treeId: number, force?: boolean) => Promise<void>
  deleteNode: (personId: string) => Promise<void>
  loadTreeMedia: (treeId: number) => Promise<void>
  loadPersonEducation: (personId: string) => Promise<void>
}

export const useTreeStore = create<TreeStoreState>((set, get) => ({
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

  setCurrentTreeId: (treeId) => set({ currentTreeId: treeId }),
  setCurrentTree: (currentTree) => set({ currentTree }),
  setPeople: (people) => set({ people }),
  setRelations: (relations) => set({ relations }),
  setTreeMedia: (treeMedia) => set({ treeMedia }),
  setError: (error) => set({ error }),

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
    set({ isLoading: true, error: null })
    try {
      // After deletion, reload the current tree to reflect changes
      const currentTreeId = get().currentTreeId
      await personApi.deletePerson(personId)
      if (currentTreeId) {
        await get().loadCurrentTree(currentTreeId, true) // Force reload to bypass cache
      }
    } catch (error) {
      console.error(error)
      set({
        error: error instanceof Error ? error.message : 'Unable to delete person',
      })
    } finally {
      set({ isLoading: false })
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
}))
