 
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface TreeCounts {
  persons: number;
  media: number;
}

export interface OwnedTree {
  id: number;
  name: string;
  slug: string;
  type: "FAMILY" | "EDUCATIONAL";
  coverImage: string | null;
  createdAt: Date;
  _count: TreeCounts;
}

export interface SharedTree {
  shareId: string;
  permission: "VIEW_ONLY" | "MEDIA_ONLY" | "ADD_PERSON" | "CONTRIBUTOR" | "EDITOR" | "FULL_ACCESS";
  tree: {
    id: number;
    name: string;
    slug: string;
    type: "FAMILY" | "EDUCATIONAL";
    coverImage: string | null;
    createdAt: Date;
    user: UserInfo;
    _count: TreeCounts;
  };
  joinedAt: Date;
  addedPersonsCount: number;
}

export interface RecentActivity {
  id: number;
  action: string; // e.g., "CREATE_PERSON", "UPLOAD_MEDIA", "CREATE_RELATION"
  entity: string | null; // e.g., "Person", "Media", "Tree"
  entityId: string | null;
  createdAt: Date;
  metadata: Record<string, any> | null;
  user: UserInfo | null;
}

export interface KPIs {
  totalOwnedTrees: number;
  totalSharedTrees: number;
  totalPersons: number;
  totalMedia: number;
  totalCollaborators: number;
}

export interface DashboardData {
  ownedTrees: OwnedTree[];
  sharedTrees: SharedTree[];
  recentActivities: RecentActivity[];
  kpis: KPIs;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
