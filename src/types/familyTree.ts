import type { TreeSummary } from '@/types'

export interface EducationItem {
  id: number
  title: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string | null
  level?: string
  description?: string
  degreeUrl?: string
}

export interface MediaItem {
  id: number
  type: 'photo' | 'video' | 'document'
  title: string
  date: string
  url?: string
  thumbnail?: string
  description?: string
}

export interface RelationItem {
  id: string
  treeId: number
  fromId: string
  toId: string
  type: "PARENT_OF" | "CHILD_OF" | "SPOUSE_OF" | "SIBLING_OF"
  metadata?: unknown
  isActive?: boolean
}

export interface PersonDetail {
  id: string
  slug: string
  createdByMemberId?: string | null
  fullName: string
  gender: 'male' | 'female'
  birthDate: string | null
  deathDate: string | null
  notes?: string
  birthPlace?: string
  avatarUrl?: string
  education: EducationItem[]
  media: MediaItem[]
}

export interface CreatePersonData {
  id?: string
  slug?: string
  createdByMemberId?: string | null
  fullName: string
  gender: 'male' | 'female' | null
  birthDate: string | null
  deathDate: string | null
  notes?: string
  birthPlace?: string
  avatarUrl?: string | null
  relations?: {
    toId: string
    type: 'PARENT_OF' | 'CHILD_OF' | 'SPOUSE_OF' | 'SIBLING_OF'
    metadata?: object
    isActive?: boolean
  }[]
}

export interface treeLink {
  id: string
  treeId: number
  permission: string
  link: string
  token: string
  expiresAt?: string | null
  personLimit?: number | null
  createdAt?: string | null
}

export interface SharedTreeAccess {
  token: string
  tree: TreeSummary
  permission: string
  rights: string[]
  personLimit?: number | null
  expiresAt?: string | null
  member: {
    id: string
    tokenId: string
    userId: string
    addedPersonsCount: number
    joinedAt: string
    updatedAt: string
  }
}

export interface SharedTreeData extends SharedTreeAccess {
  people: PersonDetail[]
  relations: RelationItem[]
  media: MediaItem[]
}



export interface CollaboationItem {
  id: string
  token: string
  permission: 'VIEWER' | 'EDITOR'
  personLimit: number
  expiresAt: string | null
  tree: {
    id: number
    name: string
    slug: string
  }
  link: string
}


