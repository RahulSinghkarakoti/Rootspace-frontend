import type { ApiResponse } from '@/types'
import { api } from './axios'
import type { EducationItem } from '@/types/familyTree'

export const educationApi = {
  createEducation: (personId: string, payload: Partial<EducationItem>) =>
    api.post<ApiResponse<EducationItem>>(`/people/${personId}/education`, payload),
  updateEducation: (educationId: string, payload: Partial<EducationItem>) =>
    api.patch<ApiResponse<EducationItem>>(`/education/${educationId}`, payload),
  deleteEducation: (educationId: string) => api.delete<ApiResponse<null>>(`/education/${educationId}`),
}
