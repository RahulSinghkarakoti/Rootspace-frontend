# Graph Report - Rootspace-frontend  (2026-11-01)

## Corpus Check
- 84 files · ~30,752 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 453 nodes · 1505 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a0de0707`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Button
- cn
- familyTree.ts
- SharedTreesPage.tsx
- package.json
- App.tsx
- dependencies
- compilerOptions
- SharedTreeAccessPage.tsx
- compilerOptions
- dashboard.types.ts
- vercel.json
- SettingsPrivacySafetyPage.tsx

## God Nodes (most connected - your core abstractions)
1. `Button` - 55 edges
2. `cn()` - 55 edges
3. `react` - 39 edges
4. `lucide-react` - 29 edges
5. `App()` - 25 edges
6. `useToast()` - 25 edges
7. `useTreeStore` - 25 edges
8. `useAppStore` - 23 edges
9. `useAuthStore` - 22 edges
10. `DialogContent` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `PersonDetail`  [EXTRACTED]
  src/components/layout/PersonDetailSidebar.tsx → src/types/familyTree.ts
- `SharedTreeAccessRowProps` --references--> `SharedTreeItem`  [EXTRACTED]
  src/pages/dashboard/SharedTreeAccessPage.tsx → src/types/familyTree.ts
- `App()` --calls--> `DashboardLayout()`  [EXTRACTED]
  src/App.tsx → src/components/layout/DashboardLayout.tsx
- `AddTreeDialogProps` --references--> `TreeSummary`  [EXTRACTED]
  src/components/dialogs/AddTreeDialog/AddTreeDialog.tsx → src/types/index.ts
- `AddTreeDialog()` --calls--> `Label`  [EXTRACTED]
  src/components/dialogs/AddTreeDialog/AddTreeDialog.tsx → src/components/ui/label.tsx

## Import Cycles
- 4-file cycle: `src/api/axios.ts -> src/store/authStore.ts -> src/store/treeStore.ts -> src/api/personApi.ts -> src/api/axios.ts`
- 4-file cycle: `src/api/axios.ts -> src/store/authStore.ts -> src/store/treeStore.ts -> src/api/treesApi.ts -> src/api/axios.ts`
- 4-file cycle: `src/api/axios.ts -> src/store/authStore.ts -> src/store/sharedTreeStore.ts -> src/api/treesApi.ts -> src/api/axios.ts`

## Communities (16 total, 3 thin omitted)

### Community 0 - "Button"
Cohesion: 0.12
Nodes (51): react-hook-form, @tanstack/react-query, educationApi, uploadApi, AddTreeDialog(), defaultFormValues, ACCEPTED_TYPES, AvatarUploadDialog() (+43 more)

### Community 1 - "cn"
Cohesion: 0.10
Nodes (38): class-variance-authority, @radix-ui/react-label, @radix-ui/react-select, @radix-ui/react-slot, react, DashboardLayout(), Navbar(), SettingSidebar() (+30 more)

### Community 2 - "familyTree.ts"
Cohesion: 0.09
Nodes (38): @radix-ui/react-dropdown-menu, zustand, api, pendingQueue, personApi, treesApi, AvatarUploadResult, AvatarUploadSignature (+30 more)

### Community 3 - "SharedTreesPage.tsx"
Cohesion: 0.07
Nodes (42): html-to-image, @xyflow/react, BridgeNode(), AddButton(), AddButtonProps, FamilyMemberNode(), FamilyMemberNodeData, Props (+34 more)

### Community 4 - "package.json"
Cohesion: 0.04
Nodes (41): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+33 more)

### Community 5 - "App.tsx"
Cohesion: 0.09
Nodes (43): lucide-react, react-router-dom, vitest, authApi, App(), CollaboratorsPage, DashboardPage, PageFallback() (+35 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, axios, class-variance-authority, clsx, date-fns, html-to-image, i18next, lucide-react (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 8 - "SharedTreeAccessPage.tsx"
Cohesion: 0.13
Nodes (20): date-fns, @radix-ui/react-switch, @radix-ui/react-toast, iconStyles, ToastContext, ToastContextValue, ToastIcon, ToastInput (+12 more)

### Community 9 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 10 - "dashboard.types.ts"
Cohesion: 0.22
Nodes (8): AppStore, DashboardData, KPIs, OwnedTree, RecentActivity, SharedTree, TreeCounts, UserInfo

### Community 11 - "vercel.json"
Cohesion: 0.50
Nodes (3): buildCommand, outputDirectory, rewrites

### Community 15 - "SettingsPrivacySafetyPage.tsx"
Cohesion: 0.33
Nodes (5): @radix-ui/react-separator, DocSection(), PRIVACY_SECTIONS, PrivacySafetyPage(), SAFETY_SECTIONS

## Knowledge Gaps
- **137 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+132 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 154 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.11961722488038277 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `Button`, `familyTree.ts`, `SharedTreesPage.tsx`, `package.json`, `App.tsx`, `SharedTreeAccessPage.tsx`, `SettingsPrivacySafetyPage.tsx`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.10454545454545454 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `App.tsx` to `Button`, `cn`, `familyTree.ts`, `SharedTreesPage.tsx`, `package.json`, `SharedTreeAccessPage.tsx`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Should `familyTree.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09216255442670537 - nodes in this community are weakly interconnected._