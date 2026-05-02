# Contributing to Tiptap Editor

Thanks for your interest in helping out! This guide walks you through the workflow.

## Getting started

```bash
git clone https://github.com/ZanyuanYang/Text-Editor-Tiptap.git
cd Text-Editor-Tiptap
npm install
npm run dev
```

Requirements:

- Node ≥ 18.18
- npm 9+ (other package managers also work)

## Project layout

```
src/
├─ contexts/              # React contexts
├─ extensions/            # Custom Tiptap extensions
├─ hooks/
├─ lib/                   # storage, types, markdown, utils
├─ pages/Editor/          # The main editor page
├─ pages/Error/
├─ components/ui/         # shadcn/ui primitives
└─ utils/TiptapExtension/ # Custom marks (Thread)
```

## Development workflow

1. **Fork & branch.** Branch off `master` with a descriptive name: `feat/drag-handle`, `fix/link-bubble`, `docs/keyboard-shortcuts`.
2. **Hack.** Run `npm run dev` for live reload at <http://localhost:5173>.
3. **Lint & typecheck.** Before pushing, run:
   ```bash
   npm run typecheck
   npm run build
   ```
   The `build` script runs `tsc` + `vite build` and must pass.
4. **Commit.** Use [Conventional Commits](https://www.conventionalcommits.org/) where possible:
   - `feat: add /toggle command`
   - `fix: respect emoji in saved title`
   - `docs: tighten roadmap`
   - `refactor: extract storage helpers`
   - `chore: bump tiptap to 3.23`
5. **Open a PR.** Fill out the template. Smaller PRs land faster.

## Code style

- TypeScript strict — no `any` unless you have a really good reason.
- Functional React components + hooks. No class components.
- Prefer composition over inheritance.
- Tailwind classes for styling; avoid inline `style` props except for editor-bound color inputs.
- Keep components focused. If a file grows beyond ~500 LOC, consider splitting.
- Treat `localStorage` as the source of truth for documents — never mutate it directly, go through `lib/storage.ts`.

Run Prettier before committing if your editor doesn't auto-format:

```bash
npx prettier --write "src/**/*.{ts,tsx,scss,css}"
```

## Adding a Tiptap extension

We only ship **free** Tiptap extensions. If a paid Tiptap Cloud / Pro feature is necessary, we re-implement it as a custom mark/extension (see `src/utils/TiptapExtension/ThreadExtension.tsx` for an example).

To add an extension:

1. Install: `npm install @tiptap/extension-foo` (pin to the same `^3.x` version).
2. Register it in `src/contexts/tiptap_context.tsx` inside the `extensions` array.
3. Wire the toolbar / slash command in `src/pages/Editor/index.tsx` and `src/extensions/SlashCommand.tsx` if user-facing.
4. Update the README feature table.

## Reporting a bug

Use the **Bug report** template. Please include:

- Browser & OS
- Reproduction steps
- Expected vs. actual behavior
- Screenshots / screen recording if it's visual

## Proposing a feature

Use the **Feature request** template. Frame it as a problem first, solution second:

> Today I can't ___ because ___. What if we ___?

## Releasing

Maintainers cut releases by:

1. Updating `version` in `package.json`
2. Adding the entry to `CHANGELOG.md`
3. Tagging: `git tag v0.x.y && git push --tags`

## Code of Conduct

Be excellent to each other. Disagree on the code, never on the person.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
