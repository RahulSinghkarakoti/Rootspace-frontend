export interface EducationItem {
  id: number
  institution: string
  degree: string
  field: string
  from: string
  to: string | null
  description?: string
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



