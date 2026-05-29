import { treeLink } from "./familyTree"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  plan?: 'free' | 'pro' | 'family'
  createdAt?: string
  role?: string
  isVerified?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface FamilyMember {
  id: string
  name: string
  birthDate?: string
  deathDate?: string
  gender: 'male' | 'female' | 'other'
  avatar?: string
  bio?: string
  parentIds: string[]
  spouseIds: string[]
  childIds: string[]
}

export interface FamilyTree {
  id: string
  name: string
  description?: string
  ownerId: string
  isPublic: boolean
  shareToken?: string
  members: FamilyMember[]
  createdAt: string
  updatedAt: string
}

export interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  sidebarCollapsed: boolean
}

export type TreeType = 'FAMILY' | 'EDUCATIONAL'

export interface TreeSummary {
  id: number
  name: string
  slug: string
  type: TreeType
  createdBy: string | null
  linkHistory?: treeLink[]
  _count: {
    persons: number
  }
}

export interface ApiResponse<T> {
  link: any
  success: boolean
  message: string
  data: T
  meta?: unknown
  errors?: unknown
}

export interface CreateTreePayload {
  treeName: string
  type?: TreeType
  coverImage?: string | null
  isPublic?: boolean
}
 
