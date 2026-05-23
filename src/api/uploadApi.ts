import type { ApiResponse } from '@/types'
import { api } from './axios'

export interface AvatarUploadSignature {
  uploadUrl: string
  apiKey: string
  cloudName: string
  folder: string
  timestamp: number
  signature: string
}

export interface AvatarUploadResult {
  personId: string
  avatarUrl: string
  publicId: string
}

export const uploadApi = {
  getAvatarUploadSignature: () =>
    api.get<ApiResponse<AvatarUploadSignature>>('/upload/signature'),

  saveAvatar: (payload: {
    personId: string
    cloudinaryUrl: string
    publicId: string
  }) => api.post<ApiResponse<AvatarUploadResult>>('/upload/avatar', payload),
}
