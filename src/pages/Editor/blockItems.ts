import type { Editor, Range } from '@tiptap/core';

export type BlockGroup = 'Basic' | 'Lists' | 'Media' | 'Inline';

export type BlockItem = {
  title: string;
  description: string;
  group: BlockGroup;
  icon: string;
  keywords?: string[];
  command: (props: { editor: Editor; range: Range }) => void;
};

export const BLOCK_ITEMS: BlockItem[] = [
  {
    title: 'Text',
    description: 'Plain paragraph',
    group: 'Basic',
    icon: '¶',
    keywords: ['paragraph', 'p', 'text'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('paragraph').run(),
  },
  {
    title: 'Heading 1',
    description: 'Big section heading',
    group: 'Basic',
    icon: 'H1',
    keywords: ['h1', 'title'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    group: 'Basic',
    icon: 'H2',
    keywords: ['h2'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    group: 'Basic',
    icon: 'H3',
    keywords: ['h3'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run(),
  },
  {
    title: 'Quote',
    description: 'Blockquote',
    group: 'Basic',
    icon: '"',
    keywords: ['blockquote', 'quote'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: 'Divider',
    description: 'Horizontal line',
    group: 'Basic',
    icon: '—',
    keywords: ['hr', 'divider', 'rule'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: 'Code Block',
    description: 'Syntax-highlighted block',
    group: 'Basic',
    icon: '</>',
    keywords: ['code', 'pre'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Bulleted List',
    description: 'Simple bulleted list',
    group: 'Lists',
    icon: '•',
    keywords: ['ul', 'unordered'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .clearNodes()
        .toggleBulletList()
        .run(),
  },
  {
    title: 'Numbered List',
    description: 'List with numbers',
    group: 'Lists',
    icon: '1.',
    keywords: ['ol', 'ordered'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .clearNodes()
        .toggleOrderedList()
        .run(),
  },
  {
    title: 'To-do List',
    description: 'Track tasks with checkboxes',
    group: 'Lists',
    icon: '☐',
    keywords: ['task', 'todo', 'check'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .clearNodes()
        .toggleTaskList()
        .run(),
  },
  {
    title: 'Image',
    description: 'Embed an image by URL',
    group: 'Media',
    icon: '🖼',
    keywords: ['image', 'picture'],
    command: ({ editor, range }) => {
      const url = window.prompt('Image URL');
      if (!url) return;
      editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
    },
  },
  {
    title: 'YouTube',
    description: 'Embed a YouTube video',
    group: 'Media',
    icon: '▶',
    keywords: ['youtube', 'video'],
    command: ({ editor, range }) => {
      const url = window.prompt('YouTube URL');
      if (!url) return;
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setYoutubeVideo({ src: url, width: 640, height: 360 })
        .run();
    },
  },
  {
    title: 'Table',
    description: '3x3 table with header row',
    group: 'Media',
    icon: '⊞',
    keywords: ['table', 'grid'],
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: 'Math equation',
    description: 'Block LaTeX formula',
    group: 'Media',
    icon: '∑',
    keywords: ['math', 'latex', 'equation', 'tex', 'formula'],
    command: ({ editor, range }) => {
      const latex = window.prompt('LaTeX (e.g. E = mc^2)');
      if (!latex) return;
      editor.chain().focus().deleteRange(range).setBlockMath(latex).run();
    },
  },
  {
    title: 'Today',
    description: "Insert today's date",
    group: 'Inline',
    icon: '📅',
    keywords: ['date', 'today'],
    command: ({ editor, range }) => {
      const text = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      editor.chain().focus().deleteRange(range).insertContent(text).run();
    },
  },
  {
    title: 'Now',
    description: 'Insert current date and time',
    group: 'Inline',
    icon: '🕐',
    keywords: ['time', 'now', 'date'],
    command: ({ editor, range }) => {
      const text = new Date().toLocaleString();
      editor.chain().focus().deleteRange(range).insertContent(text).run();
    },
  },
  {
    title: 'Special character',
    description: '© ™ ° ± ÷ × … →',
    group: 'Inline',
    icon: 'Ω',
    keywords: ['symbol', 'special', 'unicode'],
    command: ({ editor, range }) => {
      const ch = window.prompt(
        'Pick a character to insert',
        '© ™ ® ° ± × ÷ … → ← ↑ ↓ ✓ ✗ ★ ♥ Ω π ∞'
      );
      if (!ch) return;
      editor.chain().focus().deleteRange(range).insertContent(ch).run();
    },
  },
];

export function filterBlockItems(query: string): BlockItem[] {
  if (!query) return BLOCK_ITEMS;
  const q = query.toLowerCase();
  return BLOCK_ITEMS.filter((it) => {
    const hay = [it.title, it.description, ...(it.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

export function groupBlockItems(
  items: BlockItem[]
): Record<string, BlockItem[]> {
  return items.reduce<Record<string, BlockItem[]>>((acc, it) => {
    (acc[it.group] = acc[it.group] || []).push(it);
    return acc;
  }, {});
}
