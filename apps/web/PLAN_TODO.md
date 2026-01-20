# AI-Chart Frontend Implementation Plan

## 1. Vision & Strategy
Build a **Personal Data Intelligence Dashboard** that evolves from a traditional navigation-based app to an **Intent-based AI Workbench**.

*   **Core Philosophy**: Chat-First + Dynamic Canvas (AI Generative UI).
*   **Platform**: Single Responsive Web App (Mobile & Desktop).
*   **Deployment**: PWA capable (Add to Home Screen).

## 2. Tech Stack (Frontend)
*   **Framework**: React 18 + Vite
*   **Styling**: Tailwind CSS
*   **UI Components**: shadcn/ui (Radix UI) + Lucide Icons
*   **State Management**: React Query (Server state) + React Context (Local/Global UI state)
*   **Routing**: TanStack Router
*   **Visualization**: Recharts + @json-render/react (Generative UI)
*   **Markdown**: streamdown (for streaming markdown)
*   **Forms**: React Hook Form + Zod

## 3. Layout Architecture

### Desktop (Large Screens)
**Three-Column "Workbench" Layout**
1.  **Left Sidebar (Navigation & History)**:
    *   App Navigation (Dashboard, Settings).
    *   Chat History list.
2.  **Center (Chat Stream)**:
    *   Main interaction area.
    *   Rich text input (Drag & drop, commands).
3.  **Right Canvas (Dynamic Artifacts)**:
    *   Area to render AI-generated heavy content (Charts, Forms, PDF Previews).
    *   Persistent view for reference while chatting.

### Mobile (Small Screens)
**Stack / Drawer Layout**
1.  **Main View**: Chat Stream (Full width).
2.  **Navigation**: Hamburger menu -> Left Sheet (Slide-out).
3.  **Canvas Content**: Interactive "Thumbnail Cards" in chat -> Tap to open **Bottom Drawer** (or Fullscreen Modal).

## 4. Implementation Steps (TODO List)

### Phase 1: Foundation & Setup
- [x] **Install Core Dependencies**
    - [x] `tailwindcss`, `postcss`, `autoprefixer` (Note: Using Tailwind v4 with Vite plugin)
- [x] `class-variance-authority`, `clsx`, `tailwind-merge` (utils)
- [x] `lucide-react` (icons)
- [x] **Initialize shadcn/ui**
    - [x] Run initialization CLI.
    - [x] Add essential components: `button`, `input`, `sheet`, `dialog`, `scroll-area`, `separator`, `avatar`, `card`, `resizable` (for desktop split).
- [x] **Router Setup**
    - [x] Configure TanStack Router.
    - [x] Define route tree: `__root`, `index` (dashboard), `chat.$chatId`.

### Phase 2: The App Shell (Layout)
- [x] **Responsive Layout Component**
    - [x] Create `AppShell` container.
    - [x] Implement `useMobile` hook (media query detection).
- [x] **Sidebar (Left)**
    - [x] Desktop: Permanent sidebar using `ResizablePanel`.
    - [x] Mobile: `Sheet` (Slide-over) component triggered by header button.
- [x] **Canvas (Right/Drawer)**
    - [x] Create Context (`CanvasContext`) to manage: `isOpen`, `contentType` (chart/form), `data`.
    - [x] Desktop: Right `ResizablePanel`.
    - [x] Mobile: `Drawer` component from shadcn/ui. (Note: Used Sheet/Drawer pattern)

### Phase 3: The Chat Interface
- [x] **Message Bubble Component**
    - [x] User message styles.
    - [x] AI message styles (Markdown support using `streamdown`).
    - [ ] "Tool Call" indicators (e.g., "Analyzing PDF...", "Generating Chart...").
- [ ] **Artifact Cards (Mini-Canvas)**
    - [ ] Create UI for "Charts", "Forms" when they appear *inside* the chat stream (mobile thumbnail view).
- [x] **Input Area**
    - [x] Auto-expanding text area.
    - [x] File upload button (handle standard HTML5 file input).

### Phase 4: Dynamic Canvas Content
- [ ] **Chart Renderer**
    - [ ] Integrate `recharts`.
    - [ ] Create a generic `DynamicChart` component that takes `{ type: 'bar', data: [] }` props.
- [ ] **Form Renderer**
    - [ ] Integrate `react-hook-form` + `zod`.
    - [ ] Create a `DynamicForm` that renders fields based on AI-generated schema (Health Record / Finance Record).

### Phase 5: Integration (Mock first, then Real)
- [ ] **Mock AI Service**
    - [ ] Simulate "Upload File" -> Returns "Parsing" -> Returns "Show Form Intent".
    - [ ] Simulate "Show me trends" -> Returns "Show Chart Intent".
- [ ] **Real API Integration**
    - [ ] Connect `apps/server` endpoints (`/api/chat`, `/api/upload`).
    - [ ] Handle real-time streaming responses (Vercel AI SDK `useChat`).

## 5. Next Immediate Action
Start **Phase 1: Foundation & Setup** to get the styling and component library ready.
