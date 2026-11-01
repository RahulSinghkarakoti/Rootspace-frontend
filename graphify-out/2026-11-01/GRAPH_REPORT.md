# Graph Report - Rootspace-frontend  (2026-11-01)

## Corpus Check
- 84 files · ~29,845 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 443 nodes · 1461 edges · 13 communities (10 shown, 3 thin omitted)
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
- compilerOptions
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `Button` - 57 edges
2. `cn()` - 55 edges
3. `react` - 38 edges
4. `lucide-react` - 30 edges
5. `App()` - 26 edges
6. `useToast()` - 23 edges
7. `useTreeStore` - 23 edges
8. `DialogContent` - 21 edges
9. `useAppStore` - 21 edges
10. `useAuthStore` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Props` --references--> `PersonDetail`  [EXTRACTED]
  src/components/layout/PersonDetailSidebar.tsx → src/types/familyTree.ts
- `SharedTreeAccessRowProps` --references--> `SharedTreeItem`  [EXTRACTED]
  src/pages/dashboard/SharedTreeAccessPage.tsx → src/types/familyTree.ts
- `App()` --calls--> `SettingsLayout()`  [EXTRACTED]
  src/App.tsx → src/components/layout/SettingsLayout.tsx
- `App()` --calls--> `CollaboratorsPage()`  [EXTRACTED]
  src/App.tsx → src/pages/dashboard/CollaboratorsPage.tsx
- `App()` --calls--> `DashboardPage()`  [EXTRACTED]
  src/App.tsx → src/pages/dashboard/DashboardPage.tsx

## Import Cycles
- None detected.

## Communities (13 total, 3 thin omitted)

### Community 0 - "Button"
Cohesion: 0.11
Nodes (51): react-hook-form, @tanstack/react-query, educationApi, uploadApi, AddTreeDialog(), defaultFormValues, ACCEPTED_TYPES, AvatarUploadDialog() (+43 more)

### Community 1 - "cn"
Cohesion: 0.09
Nodes (40): class-variance-authority, date-fns, @radix-ui/react-scroll-area, @radix-ui/react-select, @radix-ui/react-slot, @radix-ui/react-switch, react, SettingSidebar() (+32 more)

### Community 2 - "familyTree.ts"
Cohesion: 0.11
Nodes (35): axios, zustand, api, pendingQueue, personApi, treesApi, AvatarUploadResult, AvatarUploadSignature (+27 more)

### Community 3 - "SharedTreesPage.tsx"
Cohesion: 0.08
Nodes (38): html-to-image, @xyflow/react, BridgeNode(), AddButton(), AddButtonProps, FamilyMemberNode(), FamilyMemberNodeData, Props (+30 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (39): devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom, typescript (+31 more)

### Community 5 - "App.tsx"
Cohesion: 0.05
Nodes (64): lucide-react, @radix-ui/react-separator, @radix-ui/react-toast, react-router-dom, authApi, App(), queryClient, RootRedirect() (+56 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (29): dependencies, axios, class-variance-authority, clsx, date-fns, html-to-image, i18next, lucide-react (+21 more)

### Community 7 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 9 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 11 - "vercel.json"
Cohesion: 0.50
Nodes (3): buildCommand, outputDirectory, rewrites

## Knowledge Gaps
- **133 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+128 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 159 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.112) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _133 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Button` be split into smaller, more focused modules?**
  _Cohesion score 0.11141975308641976 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `Button`, `SharedTreesPage.tsx`, `package.json`, `App.tsx`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.0936408106219427 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `App.tsx` to `Button`, `cn`, `SharedTreesPage.tsx`, `package.json`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Should `familyTree.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._