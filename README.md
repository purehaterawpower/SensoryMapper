# SensoryMapper

A Next.js web application for creating and sharing accessible sensory experience maps.

## Project Overview

**Stack:** Next.js 16 (App Router), Firebase (Firestore, Auth, App Hosting), TypeScript, Tailwind CSS, Radix UI (shadcn/ui), Lucide React

**Core Functionality:** Users upload floor plans and annotate them with sensory data (visual, auditory, etc.) and amenities to help neurodivergent individuals navigate spaces.

**Key Architecture:** Explicit separation between Editor Mode (Home Page) and Read-Only Viewer (Shared URL).

## Architecture & State Management

### 1. Data Models (`src/lib/types.ts`)

- **Strict Typing:** All map items (`Item`) use discriminated unions based on shape: `'marker' | 'rectangle' | 'circle' | 'polygon'`
- **Discriminated Unions:** When handling items, always check `item.shape` or `item.type` to narrow types before accessing specific properties (e.g., `radius` exists only on `CircleShape`)
- **MapData Structure:** `{ mapImage: string, imageDimensions: { width, height }, items: Item[] }`

### 2. Component Hierarchy & Responsibilities

- **`SenseMapper.tsx`** - The main orchestrator
  - Manages state: `items`, `activeTool`, `zoomLevel`, `panOffset`
  - Handles mouse/keyboard events for drawing and panning
  - Accepts `readOnly` prop which propagates to children to disable editing features

- **`MapArea.tsx`** - Pure presentation layer
  - Handles SVG rendering of shapes and markers

- **`AnnotationEditor.tsx`** - Dual-purpose component
  - **Edit Mode:** Renders form inputs (Textarea, Slider) for modifying item details
  - **Read-Only Mode:** Renders static "Info Card" views (Text, Progress Bar) for viewing details

### 3. Firebase Architecture

- **Client-Side Initialization:** Singleton pattern via `src/firebase/index.ts` called inside `FirebaseClientProvider`
- **Server-Side Initialization:** Use `src/firebase/server.ts` for Server Components/Actions

- **Custom Hooks (CRITICAL):**
  - `useDoc` - Real-time document listener. **Requirement:** The Firestore reference passed to this hook MUST be memoized using `useMemo` to prevent infinite render loops
  - `useCollection` - Real-time collection listener. Same memoization requirement applies

- **Write Operations:** Use "Non-blocking" functions in `src/firebase/non-blocking-updates.tsx`. These catch errors and emit them to the global `FirebaseErrorListener` rather than throwing

## Critical Developer Patterns

### Next.js 16 Compatibility

- **Async Params:** In `page.tsx`, `layout.tsx`, and `route.ts`, the `params` prop is a Promise
  - ✅ **DO:** `const { mapId } = await props.params;`
  - ❌ **DON'T:** `const mapId = props.params.mapId;`

### Read-Only vs. Edit Mode

- **Prop Propagation:** The `readOnly` boolean prop must be passed down: `page.tsx → SenseMapper → MapArea / Sidebar / AnnotationEditor`
- **UI Logic:** Components must conditionally render interactive elements based on `readOnly`
  - Example: Hide "Save" buttons, replace `<input>` with `<p>`, disable drag-and-drop logic

### Image Handling

- **Storage:** Images are currently stored as Data URLs (Base64) strings directly in Firestore documents
- **Loading:** Use standard `<img>` for raw display or `next/image` where optimization is possible (though Data URLs bypass Next.js optimization)

### Constants

- `src/lib/constants.ts` contains all static definitions for Sensory Types and Amenities (colors, icons, labels)
- Always reference these constants instead of hardcoding values

## Common Pitfalls to Avoid

- **Infinite Loops in `useDoc`:** Creating a `doc()` ref inside the component body without `useMemo`
- **Hydration Errors:** Passing Firestore Timestamp objects directly to Client Components. Convert to ISO strings or null in `getMapData`
- **Turbopack Errors:** Avoid circular dependencies, especially between `types.ts` and component files
