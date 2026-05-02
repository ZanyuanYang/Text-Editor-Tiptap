# Notion-Style Editor Overhaul — Design Spec

**Date:** 2026-05-01
**Status:** Approved for implementation
**Scope:** Full feature, UI, performance, and open-source overhaul of the Tiptap text editor.

---

## 1. Goals

Transform the existing single-page Tiptap demo into a polished, browser-based, Notion-like writing app with:

- Multi-document support with local persistence
- Modern slash-command and contextual menu UX
- Clean three-pane layout with working dark mode
- Production-grade typography, performance, and code quality
- Open-source-ready repo (README, contributing guide, templates)

**Hard constraint:** Use only free Tiptap extensions. No Tiptap Pro / Cloud features.

## 2. Non-Goals

- Real-time collaboration / Yjs sync server
- Authentication or backend
- AI features
- Mobile-first responsive (desktop-first; usable on tablet)

## 3. Architecture

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Header (logo · doc title · save status · theme · export)    │
├──────────┬──────────────────────────────────┬───────────────┤
│ Sidebar  │ Editor                            │ TOC + Threads │
│ (pages)  │ (centered, max-w-3xl)             │ (collapsible) │
│          │                                   │               │
│ + New    │  # Document title                 │  Outline      │
│  Doc1    │  /slash menu, bubble menu, etc.   │  - Heading 1  │
│  Doc2    │                                   │  - Heading 2  │
│          │                                   │               │
│          │                                   │  Threads      │
└──────────┴──────────────────────────────────┴───────────────┘
                     ┌──────────────────────────┐
                     │ Status bar: words · saved │
                     └──────────────────────────┘
```

### 3.2 Module Boundaries

| Module | Responsibility |
|---|---|
| `lib/storage` | localStorage CRUD for documents, debounced autosave |
| `contexts/documents_context` | Document list, active document, CRUD operations |
| `contexts/tiptap_context` | Editor instance, threads (per active doc) |
| `pages/Editor/Sidebar` | Document list, new/rename/delete/reorder |
| `pages/Editor/Header` | Title input, save indicator, export, theme toggle |
| `pages/Editor/Editor` | Tiptap surface, slash/bubble/floating menus |
| `pages/Editor/RightPanel` | Tabbed: Outline (TOC) + Threads |
| `pages/Editor/StatusBar` | Word/char count, last saved |
| `extensions/SlashCommand` | Custom `@tiptap/suggestion` implementation |
| `extensions/Thread` | Existing thread mark (kept, refactored) |

### 3.3 Data Model

```ts
type Document = {
  id: string;                    // uuid
  title: string;
  emoji: string;                 // single emoji, default 📄
  content: JSONContent;          // tiptap JSON, not HTML
  threads: ThreadType[];
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  order: number;
};

// localStorage keys
// "tiptap-editor:documents:v1" -> Record<string, Document>
// "tiptap-editor:active-doc:v1" -> string (id)
// "tiptap-editor:theme:v1"      -> "light" | "dark" | "system"
```

We store **JSON** instead of HTML to avoid round-trip information loss.

## 4. Features

### 4.1 Editor Extensions (free only)

- StarterKit (already)
- TextAlign, TextStyle, Color, Highlight (already)
- Underline, CodeBlockLowlight, Image, Table* (already)
- **Link** — `@tiptap/extension-link` with edit-in-bubble
- **TaskList + TaskItem** — checkboxes
- **Placeholder** — "Press '/' for commands…"
- **CharacterCount** — config: no limit
- **Typography** — smart quotes, em-dash, arrows
- **Subscript / Superscript**
- **HorizontalRule**
- **Youtube** — embed by URL
- **SlashCommand** (custom) — uses `@tiptap/suggestion`
- **DragHandle** (custom) — DOM-based, not Tiptap Pro

### 4.2 Slash Commands

Trigger on `/` at line start or after space. Categories:

- **Basic blocks**: Text, H1, H2, H3, Bullet list, Numbered list, Task list, Quote, Divider, Code block
- **Media**: Image, YouTube, Table
- **Inline**: Highlight, Link

Rendered as a positioned popover with keyboard navigation (↑↓ Enter Esc).

### 4.3 Bubble Menu

On text selection: Bold · Italic · Underline · Strike · Code · Link · Highlight · Color.

### 4.4 Floating Menu

On empty line: a `+` button that opens the slash menu.

### 4.5 Multi-Document

- Left sidebar lists docs (emoji + title), highlighted active
- `+ New Page` button creates fresh doc, switches to it, focuses title
- Hover menu: rename, change emoji, duplicate, delete
- Clicking a doc swaps editor content via `editor.commands.setContent`
- Switching docs is **debounced-flushed** so we don't lose unsaved keystrokes

### 4.6 Persistence

- On editor `update`: debounce 800ms -> write current doc JSON + threads to localStorage
- Save indicator states: `Saving…` / `Saved · 3s ago` / `Offline`
- Visibility-change + before-unload flush

### 4.7 Export / Import

- Export: copy as Markdown, download .md, download .html, copy as HTML
- Import: keep existing `.docx` via mammoth, lazy-loaded
- Markdown export: simple converter (we control schema, can iterate)

### 4.8 Outline / TOC

Right panel auto-extracts headings from JSON, click scrolls to anchor in editor.

### 4.9 Threads

Existing functionality kept. Refactored:
- Threads stored per-document in storage
- Resolved view collapsible
- `Range` removed from persisted shape (DOM Range can't serialize) — use ProseMirror positions

### 4.10 Theme

- Three modes: light / dark / system (uses `prefers-color-scheme`)
- Toggle in header (currently unused `ModeToggle` component is wired up)
- All hardcoded `bg-black text-white` replaced with shadcn tokens

## 5. Performance

- `moment` -> `date-fns` (~70KB savings)
- Lazy-load `mammoth`, `lowlight/common`, `youtube` extension
- `manualChunks` in Vite: `react`, `tiptap`, `radix`, `vendor`
- `useMemo` toolbar config (currently rebuilt every render)
- Drop unused `animate.css`
- Replace `lucide-react@1.x` with current major (icons currently broken on some)
- Status bar uses `editor.storage.characterCount` (cheap, debounced)

## 6. Code Quality

- Strict types: replace all `editor: any` with `Editor`
- ESLint clean (current config preserved)
- Consistent file naming: PascalCase components, camelCase utils
- Shared hooks: `useDebouncedCallback`, `useLocalStorage`, `useActiveDocument`

## 7. Open-Source Polish

- **README.md** — Badges, screenshots placeholder, demo link, features table, stack, quick start, keyboard shortcuts, roadmap, contributing, license
- **CONTRIBUTING.md** — How to set up, code style, PR process
- **CHANGELOG.md** — Keep-a-Changelog style, seed `0.2.0` entry
- **.github/ISSUE_TEMPLATE/{bug_report,feature_request}.yml**
- **.github/PULL_REQUEST_TEMPLATE.md**

## 8. Implementation Order

Plan splits cleanly because layers don't depend on later layers:

1. **Infra & cleanup** — deps swap, Vite chunks, types, drop dead files
2. **Storage + multi-doc context + sidebar** — gives every later feature persistence
3. **Editor extensions** — link, task, placeholder, count, typography, sub/sup, hr, youtube
4. **Slash + Bubble + Floating menus**
5. **Layout overhaul + dark mode + tokens**
6. **Outline panel + Drag handle + Status bar + Export**
7. **Thread refactor (per-doc, ProseMirror positions)**
8. **Open-source files** (README, CONTRIBUTING, CHANGELOG, templates)

Each step keeps the app green; I run `tsc --noEmit` and `vite build` between major steps.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Tiptap v3 API drift breaks extensions | Pin all `@tiptap/*` to existing `^3.22.5`, install new ones at same range |
| localStorage quota | Limit body to ~5MB warning, no other limits |
| Thread Range serialization broken (current bug) | Migrate to ProseMirror positions stored as `{from, to}` |
| Drag handle complexity | Implement minimal version; defer reorder-on-drop niceties |

## 10. Out of Scope (explicit)

- Real-time collaboration
- Backend / sync
- Auth
- AI assist
- Mobile gesture support
- i18n
