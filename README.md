# 🌿 RootSpace — Frontend

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-@xyflow/react-FF0072)](https://reactflow.dev/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **RootSpace** is an intuitive, modern family tree visualizer and collaborative genealogy platform. It empowers families, historians, and researchers to preserve histories, visualize complex generational kinships on an interactive canvas, collaborate with role-based permissions, and archive multimedia memories.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the App](#running-the-app)
- [Interactive Tree Canvas & Graph Layout](#-interactive-tree-canvas--graph-layout)
- [Collaboration & Permission Model](#-collaboration--permission-model)
- [Internationalization (i18n)](#-internationalization-i18n)
- [Scripts Reference](#-scripts-reference)
- [Connected Backend Repository](#-connected-backend-repository)

---

## 🌟 Overview

RootSpace Frontend is crafted to deliver a fluid, high-performance experience for rendering and editing family trees. Designed with an elegant aesthetic (pairing **Outfit** and **Playfair Display** typography with clean modern UI components), it provides deep functionality while remaining accessible to users of all technical levels.

---

## ✨ Key Features

- **Interactive Canvas & Graph Visualization**:
  - Interactive multi-generational tree exploration powered by `@xyflow/react` (React Flow).
  - Smooth pan, zoom, auto-centering, custom node rendering, and minimap navigation.
  - Custom topological graph layout engine with intelligent spacing and cycle prevention.
  - Image export (`html-to-image`) for saving high-resolution family tree snapshots.

- **Granular Collaboration & Sharing**:
  - Share invite tokens with configurable access levels:
    - `VIEW_ONLY` — Read-only canvas access
    - `MEDIA_ONLY` — Upload family photos and documents
    - `ADD_PERSON` — Add new family members (with optional person quotas)
    - `CONTRIBUTOR` — Add individuals and attach media
    - `EDITOR` — Manage and edit user-created nodes
    - `FULL_ACCESS` — Complete tree modification rights
  - Dedicated collaborator management dashboard to revoke or audit member permissions.

- **Comprehensive Person Profiles**:
  - Rich member modal tracking vital details: full name, dates (birth, death), birthplaces, biographical notes, and avatar uploads.
  - Educational milestones tracking (High School, Bachelors, Masters, PhD, etc.).
  - Kinship relationship builders: `PARENT_OF`, `SPOUSE_OF`, and `SIBLING_OF`.

- **Secure & Seamless Authentication**:
  - Email & password registration with client-side validation.
  - Google OAuth 2.0 social sign-in with seamless redirect handling.
  - JWT authentication lifecycle with automatic background token refreshes via Axios interceptors.
  - Password reset request and confirmation workflows.
  - Strict data isolation on logout across all persistent Zustand stores.

- **Internationalization (i18n)**:
  - Dual-language support in **English** and **Hindi** (`hi`) with instant runtime switching.

- **Personalization & Accessibility**:
  - Dark / Light / System theme switching via `ThemeProvider`.
  - Accessible dialogs, dropdowns, tooltips, and scroll areas built on **Radix UI** primitives.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 5](https://vitejs.dev/) |
| **Routing** | [React Router DOM v6](https://reactrouter.com/) (with code-splitting & lazy-loaded pages) |
| **Tree Visuals** | [@xyflow/react (React Flow v12)](https://reactflow.dev/) + [html-to-image](https://github.com/bubkoo/html-to-image) |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) (with local storage persistence) |
| **Data Fetching** | [TanStack React Query v5](https://tanstack.com/query) + [Axios](https://axios-http.com/) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [Lucide React](https://lucide.dev/) |
| **Styling** | [Tailwind CSS v3](https://tailwindcss.com/) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) + [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| **Localization** | [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 📂 Project Architecture

```
Frontend/
├── public/                 # Static assets & public icons
├── src/
│   ├── api/                # Axios instance & domain API modules
│   │   ├── authApi.ts      # Authentication & Google OAuth endpoints
│   │   ├── axios.ts        # Axios client with JWT refresh interceptors
│   │   ├── educationApi.ts # Education history CRUD
│   │   ├── personApi.ts    # Person nodes CRUD
│   │   ├── treesApi.ts     # Tree management & share endpoints
│   │   └── uploadApi.ts    # File & media upload services
│   ├── assets/             # Branding logos & imagery
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # ProtectedRoute, PublicOnlyRoute, OAuth buttons
│   │   ├── dialogs/        # Person modals, Add Member, Share Link dialogs
│   │   ├── education/      # Education forms & timeline cards
│   │   ├── layout/         # DashboardLayout, Sidebar, Navbar, SettingsLayout
│   │   └── ui/             # Radix-backed buttons, inputs, toasts, switches
│   ├── hooks/              # Custom React hooks (useAuth, etc.)
│   ├── locales/            # i18n dictionary translations
│   │   ├── en.json         # English translations
│   │   └── hi.json         # Hindi translations
│   ├── pages/              # Routed pages (code-split via React.lazy)
│   │   ├── dashboard/      # DashboardPage, TreeEditorPage, TreesPage,
│   │   │                   # CollaboratorsPage, SharedTreesPage, Settings
│   │   ├── GoogleCallbackPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── store/              # Zustand client-state stores
│   │   ├── appStore.ts     # UI settings, theme & notification state
│   │   ├── authStore.ts    # User session, JWT tokens & logout isolation
│   │   ├── sharedTreeStore.ts # Collaboration state & shared trees
│   │   └── treeStore.ts    # Active tree canvas & nodes state
│   ├── types/              # TypeScript schemas & type definitions
│   ├── utils/              # Graph algorithms & permission validation
│   │   ├── permission.ts   # Client-side permission evaluator
│   │   └── treeLayoutUtils.ts # Multi-generation node layout & cycle detection
│   ├── App.tsx             # Route definitions & Query/Theme providers
│   └── main.tsx            # Application entrypoint & i18n initialization
├── index.html              # HTML shell & Google Fonts imports
├── tailwind.config.js      # Custom theme colors, borders, and animations
├── tsconfig.json           # TypeScript configuration with @/ path aliases
└── vite.config.ts          # Vite build & proxy config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`
- **Backend API**: The [RootSpace Backend](https://github.com/RahulSinghkarakoti/RootSpace-Backend) running locally or accessible via URL.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RahulSinghkarakoti/Rootspace-frontend.git
   cd Rootspace-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the root of the `Frontend` directory by copying the example:

```bash
cp .env.example .env
```

Configure your backend URL:

```env
# URL pointing to the RootSpace Express API
VITE_API_URL=http://localhost:5000/api/v1
```

### Running the App

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 🎨 Interactive Tree Canvas & Graph Layout

The heart of RootSpace is its custom tree layout engine implemented in [`src/utils/treeLayoutUtils.ts`](src/utils/treeLayoutUtils.ts):

- **Hierarchical Generation Positioning**: Computes vertical generations (`Y` coordinate) based on parent-child chains, spacing siblings and spouses along the horizontal axis (`X` coordinate).
- **Cycle Detection**: Handles cyclical relations gracefully without crashing or creating infinite recursion loops.
- **Node Interaction**: Drag nodes freely, double-click to view detailed person bios, add parents/children directly from node action anchors, and preview connections with custom styled Bézier edges.
- **Snapshot Export**: Renders the complete canvas as an image file directly from the browser for sharing or printing.

---

## 🤝 Collaboration & Permission Model

Family trees can be shared with specific collaborators or family members using secure share tokens. The frontend dynamically toggles UI controls based on the active user's permissions:

| Permission | View | Upload Media | Add Members | Edit Details | Full Admin |
|:---|:---:|:---:|:---:|:---:|:---:|
| `VIEW_ONLY` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `MEDIA_ONLY` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ADD_PERSON` | ✅ | ❌ | ✅ *(subject to quota)* | ❌ | ❌ |
| `CONTRIBUTOR`| ✅ | ✅ | ✅ | ❌ | ❌ |
| `EDITOR` | ✅ | ✅ | ✅ | ✅ *(own nodes)* | ❌ |
| `FULL_ACCESS`| ✅ | ✅ | ✅ | ✅ | ✅ *(except delete)* |

---

## 🌐 Internationalization (i18n)

RootSpace provides built-in internationalization powered by `i18next`. Strings for dashboard metrics, node labels, relationship types, and system messages are localized:

- 🇬🇧 **English** (`en`)
- 🇮🇳 **Hindi** (`hi`)

Users can seamlessly toggle language settings from the header or settings menu.

---

## 📜 Scripts Reference

In the `Frontend/` directory, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server on `http://localhost:5173` |
| `npm run build` | Runs TypeScript compilation (`tsc`) and bundles optimized production assets |
| `npm run preview` | Locally preview the production build |
| `npm test` | Runs the Vitest test suite (layout utils, auth stores, hooks) |

---

## 🔗 Connected Backend Repository

RootSpace requires its companion backend service for user authentication, PostgreSQL database persistence, and token verification:

👉 **[RootSpace Backend Repository](https://github.com/RahulSinghkarakoti/RootSpace-Backend)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
