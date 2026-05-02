import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

export type SlashItem = {
  title: string;
  description: string;
  group: 'Basic' | 'Lists' | 'Media' | 'Inline';
  icon: string;
  keywords?: string[];
  command: (props: { editor: Editor; range: Range }) => void;
};

const ITEMS: SlashItem[] = [
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
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    group: 'Basic',
    icon: 'H2',
    keywords: ['h2'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    group: 'Basic',
    icon: 'H3',
    keywords: ['h3'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run(),
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
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    description: 'List with numbers',
    group: 'Lists',
    icon: '1.',
    keywords: ['ol', 'ordered'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: 'To-do List',
    description: 'Track tasks with checkboxes',
    group: 'Lists',
    icon: '☐',
    keywords: ['task', 'todo', 'check'],
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
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
];

function filterItems(query: string): SlashItem[] {
  if (!query) return ITEMS;
  const q = query.toLowerCase();
  return ITEMS.filter((it) => {
    const hay = [it.title, it.description, ...(it.keywords ?? [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}

type SlashListProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

type SlashListRef = {
  onKeyDown: (e: { event: KeyboardEvent }) => boolean;
};

const SlashList = forwardRef<SlashListRef, SlashListProps>((props, ref) => {
  const { items, command } = props;
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  const select = useCallback(
    (idx: number) => {
      const it = items[idx];
      if (it) command(it);
    },
    [items, command]
  );

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % Math.max(1, items.length));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % Math.max(1, items.length));
        return true;
      }
      if (event.key === 'Enter') {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-72 p-2 text-sm text-muted-foreground">
        No matching blocks
      </div>
    );
  }

  const groups = items.reduce<Record<string, SlashItem[]>>((acc, it) => {
    (acc[it.group] = acc[it.group] || []).push(it);
    return acc;
  }, {});
  let runningIndex = -1;

  return (
    <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-72 p-1 max-h-80 overflow-auto">
      {Object.entries(groups).map(([group, groupItems]) => (
        <div key={group}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
            {group}
          </div>
          {groupItems.map((it) => {
            runningIndex += 1;
            const idx = runningIndex;
            const active = idx === selected;
            return (
              <button
                key={it.title}
                type="button"
                onMouseEnter={() => setSelected(idx)}
                onClick={() => select(idx)}
                className={`w-full flex items-center gap-3 rounded-md px-2 py-1.5 text-left ${
                  active ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded border bg-background text-xs font-mono">
                  {it.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium truncate">{it.title}</span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {it.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});
SlashList.displayName = 'SlashList';

const suggestionConfig: Omit<SuggestionOptions, 'editor'> = {
  char: '/',
  startOfLine: false,
  command: ({ editor, range, props }) => {
    const item = props as SlashItem;
    item.command({ editor, range });
  },
  items: ({ query }) => filterItems(query),
  render: () => {
    let component: ReactRenderer<SlashListRef, SlashListProps> | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashList, {
          props: {
            items: props.items as SlashItem[],
            command: (item: SlashItem) => props.command(item),
          },
          editor: props.editor,
        });

        const rect = props.clientRect?.();
        if (!rect) return;
        popup = tippy('body', {
          getReferenceClientRect: () => rect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },
      onUpdate: (props) => {
        component?.updateProps({
          items: props.items as SlashItem[],
          command: (item: SlashItem) => props.command(item),
        });
        const rect = props.clientRect?.();
        if (rect && popup?.[0]) {
          popup[0].setProps({ getReferenceClientRect: () => rect });
        }
      },
      onKeyDown: (props) => {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        popup?.[0]?.destroy();
        component?.destroy();
        popup = null;
        component = null;
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return { suggestion: suggestionConfig };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommand;
