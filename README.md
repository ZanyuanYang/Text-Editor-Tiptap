<div align="center">

# Tiptap Editor

**A Notion-style, local-first block editor for the web.**
Built with [Tiptap](https://tiptap.dev), React 19, TailwindCSS and shadcn/ui — entirely from free Tiptap extensions.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Tiptap](https://img.shields.io/badge/Tiptap-3-000)](https://tiptap.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

[**Live demo →**](https://text-editor-tiptap.vercel.app)

![Tiptap Editor screenshot](src/assets/img.png)

</div>

---

## ✨ Features

| | |
|---|---|
| 📝 **Notion-style writing** | Slash `/` commands, bubble menu on selection, floating `+` button on empty lines |
| 🗂 **Multi-document workspace** | Create, rename, duplicate, delete, and emoji-tag pages from the sidebar |
| 💾 **Local-first persistence** | Auto-saves every keystroke to `localStorage`. No accounts, no servers, no telemetry |
| 🌓 **Dark / light / system theme** | Persisted across sessions, respects OS preference |
| 🧵 **Inline threads (free!)** | Comment on selections — works without Tiptap Pro/Cloud |
| 📐 **Outline panel** | Auto-generated table of contents that scrolls to headings |
| ⚡ **Smart typography** | Smart quotes, em-dashes, ellipses, arrows |
| ☑️ **Task lists** | `[ ]` checkboxes with nesting |
| 🔗 **Links** | Auto-link, edit-in-place |
| 🖼 **Media** | Images, YouTube embeds, resizable tables |
| 💻 **Syntax-highlighted code** | Powered by [lowlight](https://github.com/wooorm/lowlight) |
| 📥 **Import / Export** | `.docx` import (via [mammoth](https://github.com/mwilliamson/mammoth.js)), Markdown / HTML / clipboard export |
| ⌨️ **Keyboard-friendly** | All standard shortcuts (`⌘B`, `⌘I`, `⌘K`, `⌘Z`, …) |
| 🚀 **Production performance** | Code-split bundles, lazy-loaded heavy deps, no `moment.js` |

> **Free-extension only.** This project avoids paid Tiptap Cloud / Pro features (Comments, Drag-handle Pro, etc.). Threads are implemented as a custom mark.

## 🚀 Quick start

```bash
# Requires Node >= 18.18
npm install
npm run dev
```

Then open <http://localhost:5173>.

### Other scripts

```bash
npm run build       # type-check + production build
npm run preview     # preview the production build locally
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## 🧱 Stack

- **Editor:** [Tiptap 3](https://tiptap.dev) on [ProseMirror](https://prosemirror.net)
- **Framework:** [React 19](https://react.dev) + [React Router 7](https://reactrouter.com)
- **Build:** [Vite 7](https://vitejs.dev) with manual chunking
- **Styling:** [TailwindCSS 4](https://tailwindcss.com), [@tailwindcss/typography](https://github.com/tailwindlabs/tailwindcss-typography)
- **UI primitives:** [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) patterns
- **Icons:** [lucide-react](https://lucide.dev)
- **Date utils:** [date-fns](https://date-fns.org)
- **Suggestion popups:** [tippy.js](https://atomiks.github.io/tippyjs/)
- **Language:** TypeScript (strict mode)

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `/` | Open the slash command menu |
| `⌘ B` / `Ctrl B` | Bold |
| `⌘ I` / `Ctrl I` | Italic |
| `⌘ U` / `Ctrl U` | Underline |
| `⌘ K` / `Ctrl K` | Toggle link |
| `⌘ Z` / `Ctrl Z` | Undo |
| `⌘ ⇧ Z` / `Ctrl ⇧ Z` | Redo |
| `# ` | Heading 1 (markdown shortcut) |
| `## ` | Heading 2 |
| `> ` | Blockquote |
| `- ` / `* ` | Bullet list |
| `1. ` | Numbered list |
| ` ``` ` | Code block |

## 🗂 Project structure

```
src/
├─ contexts/              # React contexts (documents, editor, global)
├─ extensions/            # Custom Tiptap extensions (slash commands, …)
├─ hooks/                 # useDebouncedCallback, useTheme, …
├─ lib/                   # storage, markdown export, types, utils
├─ pages/
│  ├─ Editor/             # Main editor page (sidebar, toolbar, panels)
│  └─ Error/              # 404
├─ components/ui/         # shadcn/ui primitives
└─ utils/TiptapExtension/ # Custom Thread mark
```

Documents persist to `localStorage` under three namespaced keys:

```
tiptap-editor:documents:v1   → { [id]: Document }
tiptap-editor:active-doc:v1  → string (id)
tiptap-editor:theme:v1       → "light" | "dark" | "system"
```

## 🗺 Roadmap

- [ ] Drag-and-drop block reordering
- [ ] Optional cloud sync (BYO backend)
- [ ] Wiki-style `[[backlinks]]`
- [ ] Real-time collaboration via Yjs (self-hosted)
- [ ] PDF export
- [ ] Mobile-friendly UI

Have an idea? [Open an issue](https://github.com/ZanyuanYang/Text-Editor-Tiptap/issues/new/choose) — PRs welcome.

## 🤝 Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repo and create your branch from `master`
2. `npm install`, `npm run dev`
3. Run `npm run typecheck && npm run build` before submitting
4. Open a PR using the provided template

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

## 📄 License

[MIT](./LICENSE) © Zanyuan Yang and contributors.

---

<div align="center">

**[⬆ Back to top](#tiptap-editor)**

If this project helped you, ⭐ the repo to support it.

</div>
