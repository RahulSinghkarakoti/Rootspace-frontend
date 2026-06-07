// src/api/treesApi.ts
import { api } from './axios'
import type { ApiResponse, CreateTreePayload, TreeSummary } from '@/types'
import { DashboardData, DashboardResponse } from '@/types/dashboard.types';
import type { CollaboationItem, CreatePersonData, EducationItem, MediaItem, PersonDetail, RelationItem, SharedTreeAccess, SharedTreeData, SharedTreeItem, ShareLinkUpdatePayload, treeLink } from '@/types/familyTree'

export const treesApi = {
  getAll: () => api.get<ApiResponse<TreeSummary[]>>('/trees'),
  getOne: (id: string) => api.get<ApiResponse<TreeSummary>>(`/trees/${id}`),
  create: (data: CreateTreePayload) => api.post<ApiResponse<TreeSummary>>('/trees', data),
  update: (id: string, data: Partial<CreateTreePayload>) => api.patch<ApiResponse<TreeSummary>>(`/trees/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/trees/${id}`),
  share: (id: string) => api.post<ApiResponse<null>>(`/trees/${id}/share`),

  getAllTreePerson: (id: number) => api.get<ApiResponse<PersonDetail[]>>(`/trees/${id}/person`),
  getTreePerson: (id: number, personId: string) => api.get<ApiResponse<PersonDetail>>(`/trees/${id}/person/${personId}`),
  getTreeRelations: (id: number) => api.get<ApiResponse<RelationItem[]>>(`/trees/${id}/relations`),
  getTreeMedia: (id: number) => api.get<ApiResponse<MediaItem[]>>(`/trees/${id}/media`),
  getPersonEducation: (personId: string) => api.get<ApiResponse<EducationItem[]>>(`/people/${personId}/education`),



  genrateShareLink: (id: number, payload: { permission: string; expiresAt: string; personLimit?: number | null }) => api.post<ApiResponse<treeLink>>(`/trees/${id}/share`, payload),
  updateShareLink: (treeId: number, linkToken: string, payload: ShareLinkUpdatePayload) => api.patch<ApiResponse<treeLink>>(`/trees/${treeId}/share/${linkToken}`, payload),
  deleteShareLink: (linkToken: string, treeId: number) => api.delete(`/trees/${treeId}/share/${linkToken}`),

  verifySharedTree: (token: string) => api.get<ApiResponse<SharedTreeAccess>>(`/shared-trees/${token}/verify`),
  getSharedTree: (token: string) => api.get<ApiResponse<SharedTreeData>>(`/shared-trees/${token}`),
  getAllSharedTree: () => api.get<ApiResponse<SharedTreeItem[]>>('/shared-trees'),
  createSharedPerson: (token: string, personData: CreatePersonData) =>
    api.post<ApiResponse<{ newPerson: PersonDetail; createdRelations: RelationItem[]; unknownSpouse?: PersonDetail | null }>>(
      `/shared-trees/${token}/person`,
      personData,
    ),
  updateSharedPerson: (token: string, personId: string, personData: CreatePersonData) =>
    api.patch<ApiResponse<PersonDetail>>(`/shared-trees/${token}/person/${personId}`, personData),
  deleteSharedPerson: (token: string, personId: string) =>
    api.delete<ApiResponse<{ personId: string; decrementAddedCount: boolean }>>(`/shared-trees/${token}/person/${personId}`),

  getCollaborations: () => api.get<ApiResponse<CollaboationItem[]>>('/trees/collaborations'),

  getDashboardStats: () => api.get<ApiResponse<DashboardData>>('/dashboard'),
}
