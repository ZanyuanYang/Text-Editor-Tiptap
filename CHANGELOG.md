# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-05-01

### Added
- **Notion-style writing UX**
  - Slash `/` command menu with keyboard navigation, grouped blocks (basic / lists / media)
  - Bubble menu on text selection (bold, italic, underline, strike, code, highlight, link)
  - Floating `+` button on empty paragraphs
- **Multi-document workspace**
  - Sidebar with create / rename / duplicate / delete / emoji-tag actions
  - Persistent active document selection
- **Local-first persistence**
  - Auto-save to `localStorage` with debounced writes (800ms)
  - Save indicator in the header (`Saving…` / `Saved {time ago}`)
  - Flush on `visibilitychange` and `beforeunload`
- **Theming**
  - Light / dark / system theme toggle in the header
  - Tokens replace previous hardcoded `bg-black text-white`
- **New editor extensions** (all free)
  - `@tiptap/extension-link` (autolink + bubble edit)
  - `@tiptap/extension-task-list` + `task-item` (nested checkboxes)
  - `@tiptap/extension-placeholder` ("Press '/' for commands…")
  - `@tiptap/extension-character-count` (status bar)
  - `@tiptap/extension-typography` (smart quotes, em-dashes)
  - `@tiptap/extension-subscript` / `superscript`
  - `@tiptap/extension-horizontal-rule`
  - `@tiptap/extension-youtube`
- **Outline / Threads panel** in a tabbed right sidebar
- **Status bar** with word and character counts
- **Markdown / HTML export** + **clipboard copy**
- **Lazy `.docx` import** via dynamic `mammoth` import
- Open-source polish: `CONTRIBUTING.md`, `CHANGELOG.md`, GitHub issue / PR templates

### Changed
- Layout reworked to a Notion-style three-pane layout (sidebar / editor / right panel)
- Threads now persist per-document with ProseMirror positions instead of DOM `Range`
- Toolbar grouped, sticky, with keyboard-shortcut tooltips
- Vite build now uses `manualChunks` (tiptap / radix / syntax / vendor)
- TypeScript `moduleResolution` upgraded to `Bundler` to support new Tiptap subpath exports

### Removed
- `moment` (replaced by `date-fns` — ~70KB smaller)
- `animate.css` (replaced by Tailwind animation utilities)
- Obsolete `src/services/`, `src/utils/constant.ts`, `src/hooks/useThemeDetector.tsx`, `src/components/ModeToggle/`
- Hardcoded mock thread seed data

### Fixed
- Editor instance was being re-created on every render; now properly memoized
- `editor: any` typing eliminated across the codebase
- Save state was not flushed when the tab was hidden / closed

## [0.1.0] — 2025-01-01

### Added
- Initial single-document Tiptap editor
- Bold, italic, underline, strikethrough, code, blockquote
- Headings 1–5
- Bullet, ordered, code block, alignment
- Tables with resizing
- Image (rendering only)
- Custom Thread mark (free comments alternative)
- `.docx` upload via mammoth
- Color picker, highlight
- Light/dark mode detection (unused toggle)

[0.2.0]: https://github.com/ZanyuanYang/Text-Editor-Tiptap/releases/tag/v0.2.0
[0.1.0]: https://github.com/ZanyuanYang/Text-Editor-Tiptap/releases/tag/v0.1.0
