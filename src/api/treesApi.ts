// src/api/treesApi.ts
import { api } from './axios'
import type { ApiResponse, CreateTreePayload, TreeSummary } from '@/types'
import type { EducationItem, MediaItem, PersonDetail, RelationItem } from '@/types/familyTree'

export const treesApi = {
  getAll: () => api.get<ApiResponse<TreeSummary[]>>('/trees'),
  getOne: (id: string) => api.get<ApiResponse<TreeSummary>>(`/trees/${id}`),
  create: (data: CreateTreePayload) => api.post<ApiResponse<TreeSummary>>('/trees', data),
  update: (id: string, data: Partial<CreateTreePayload>) => api.put<ApiResponse<TreeSummary>>(`/trees/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/trees/${id}`),
  share: (id: string) => api.post<ApiResponse<null>>(`/trees/${id}/share`),

  getAllTreePerson: (id: number) => api.get<ApiResponse<PersonDetail[]>>(`/trees/${id}/person`),
  getTreePerson: (id: number, personId: string) => api.get<ApiResponse<PersonDetail>>(`/trees/${id}/person/${personId}`),
  getTreeRelations: (id: number) => api.get<ApiResponse<RelationItem[]>>(`/trees/${id}/relations`),
  getTreeMedia: (id: number) => api.get<ApiResponse<MediaItem[]>>(`/trees/${id}/media`),
  getPersonEducation: (personId: string) => api.get<ApiResponse<EducationItem[]>>(`/people/${personId}/education`),
}
