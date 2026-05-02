import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { Editor } from '@tiptap/react';
import DragHandle from '@tiptap/extension-drag-handle-react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Copy, Eraser, GripVertical, Plus, Trash2, Type } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { HIGHLIGHT_COLORS, TEXT_COLORS } from './constants';
import {
  filterBlockItems,
  groupBlockItems,
  type BlockItem,
} from './blockItems';

type Current = { node: ProseMirrorNode | null; pos: number };

const TURN_INTO = [
  {
    label: 'Text',
    run: (e: Editor) => e.chain().focus().setNode('paragraph').run(),
  },
  {
    label: 'Heading 1',
    run: (e: Editor) =>
      e.chain().focus().setNode('heading', { level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    run: (e: Editor) =>
      e.chain().focus().setNode('heading', { level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    run: (e: Editor) =>
      e.chain().focus().setNode('heading', { level: 3 }).run(),
  },
  {
    label: 'Quote',
    run: (e: Editor) => e.chain().focus().clearNodes().toggleBlockquote().run(),
  },
  {
    label: 'Code block',
    run: (e: Editor) => e.chain().focus().clearNodes().toggleCodeBlock().run(),
  },
  {
    label: 'Bulleted list',
    run: (e: Editor) => e.chain().focus().clearNodes().toggleBulletList().run(),
  },
  {
    label: 'Numbered list',
    run: (e: Editor) =>
      e.chain().focus().clearNodes().toggleOrderedList().run(),
  },
  {
    label: 'To-do list',
    run: (e: Editor) => e.chain().focus().clearNodes().toggleTaskList().run(),
  },
];

function InsertBlockPopover({
  editor,
  current,
}: {
  editor: Editor;
  current: Current;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  // Snapshot of current node/pos at the moment the popover opens; while it's
  // open the user may hover other blocks but we still want to insert relative
  // to the block where they clicked +.
  const anchor = useRef<Current | null>(null);

  const items = useMemo(() => filterBlockItems(query), [query]);
  const groups = useMemo(() => groupBlockItems(items), [items]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelected(0);
      anchor.current = null;
    } else {
      anchor.current = current;
      setSelected(0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setSelected(0), [query]);

  const insert = (item: BlockItem) => {
    const ctx = anchor.current ?? current;
    if (ctx.node) {
      const isEmptyParagraph =
        ctx.node.type.name === 'paragraph' && ctx.node.content.size === 0;
      if (isEmptyParagraph) {
        const pos = ctx.pos + 1;
        editor.chain().focus().setTextSelection(pos).run();
        item.command({ editor, range: { from: pos, to: pos } });
      } else {
        const insertAt = ctx.pos + ctx.node.nodeSize;
        editor
          .chain()
          .focus()
          .insertContentAt(insertAt, { type: 'paragraph' })
          .setTextSelection(insertAt + 1)
          .run();
        const newPos = insertAt + 1;
        item.command({ editor, range: { from: newPos, to: newPos } });
      }
    } else {
      const { from } = editor.state.selection;
      item.command({ editor, range: { from, to: from } });
    }
    setOpen(false);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => (s - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[selected];
      if (it) insert(it);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const activeId = items[selected]?.title;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Insert block"
          title="Insert block"
          className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-72 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b px-2 py-1.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type to filter…"
            className="w-full h-7 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-80 overflow-auto p-1">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground p-3 text-center">
              No matching blocks
            </p>
          )}
          {Object.entries(groups).map(([group, groupItems]) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
                {group}
              </div>
              {groupItems.map((it) => (
                <button
                  key={it.title}
                  type="button"
                  onMouseEnter={() =>
                    setSelected(items.findIndex((x) => x.title === it.title))
                  }
                  onClick={() => insert(it)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md px-2 py-1.5 text-left',
                    it.title === activeId && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded border bg-background text-xs font-mono">
                    {it.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium truncate">
                      {it.title}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {it.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t px-2 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>↑↓ navigate · ↵ select</span>
          <span>esc</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function BlockMenu({ editor }: { editor: Editor }) {
  const [current, setCurrent] = useState<Current>({ node: null, pos: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  const onNodeChange = useCallback(
    ({ node, pos }: { node: ProseMirrorNode | null; pos: number }) =>
      setCurrent({ node, pos }),
    []
  );

  const focusBlock = () => {
    if (!current.node) return;
    editor.chain().focus().setNodeSelection(current.pos).run();
  };

  const turnInto = (run: (e: Editor) => void) => {
    focusBlock();
    run(editor);
    setMenuOpen(false);
  };

  const duplicate = () => {
    if (!current.node) return;
    const json = current.node.toJSON();
    const insertAt = current.pos + current.node.nodeSize;
    editor.chain().focus().insertContentAt(insertAt, json).run();
    setMenuOpen(false);
  };

  const remove = () => {
    if (!current.node) return;
    const from = current.pos;
    const to = current.pos + current.node.nodeSize;
    editor.chain().focus().deleteRange({ from, to }).run();
    setMenuOpen(false);
  };

  const reset = () => {
    focusBlock();
    editor.chain().focus().unsetAllMarks().setNode('paragraph').run();
    setMenuOpen(false);
  };

  const setTextColor = (color: string) => {
    focusBlock();
    if (!color) editor.chain().focus().unsetColor().run();
    else editor.chain().focus().setColor(color).run();
    setMenuOpen(false);
  };

  const setHighlight = (color: string | null) => {
    focusBlock();
    if (!color) editor.chain().focus().unsetHighlight().run();
    else editor.chain().focus().setHighlight({ color }).run();
    setMenuOpen(false);
  };

  // Discriminate click vs drag on the grip handle: open the block menu only
  // if pointerdown→pointerup happened with no real movement. Otherwise let
  // the DragHandle library start its native drag.
  const onGripPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Suppress Radix's default "open on pointerdown" behavior on the trigger.
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    let dragged = false;
    const onMove = (ev: PointerEvent) => {
      if (
        !dragged &&
        Math.hypot(ev.clientX - startX, ev.clientY - startY) > 5
      ) {
        dragged = true;
      }
    };
    const onUp = () => {
      cleanup();
      if (!dragged) setMenuOpen(true);
    };
    const onCancel = () => cleanup();
    function cleanup() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      document.removeEventListener('dragend', onCancel);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    document.addEventListener('dragend', onCancel);
  };

  return (
    <DragHandle editor={editor} nested onNodeChange={onNodeChange}>
      <div className="flex items-center gap-0.5 pt-1 leading-none">
        <InsertBlockPopover editor={editor} current={current} />

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Block actions"
              title="Drag to move · Click to open menu"
              onPointerDown={onGripPointerDown}
              onClick={(e) => e.preventDefault()}
              className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
              Block
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type className="mr-2 h-4 w-4" />
                Turn into
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {TURN_INTO.map((t) => (
                  <DropdownMenuItem
                    key={t.label}
                    onClick={() => turnInto(t.run)}
                  >
                    {t.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center font-semibold text-xs">
                  A
                </span>
                Text color
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {TEXT_COLORS.map((c) => (
                  <DropdownMenuItem
                    key={c.name}
                    onClick={() => setTextColor(c.value)}
                  >
                    <span
                      className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded border font-semibold text-[11px]"
                      style={{ color: c.value || 'inherit' }}
                    >
                      A
                    </span>
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded bg-yellow-200 text-[10px] font-bold text-black">
                  H
                </span>
                Highlight
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setHighlight(null)}>
                  <span className="mr-2 inline-block h-4 w-4 rounded border bg-background" />
                  None
                </DropdownMenuItem>
                {HIGHLIGHT_COLORS.map((c) => (
                  <DropdownMenuItem
                    key={c.value}
                    onClick={() => setHighlight(c.value)}
                  >
                    <span
                      className="mr-2 inline-block h-4 w-4 rounded border"
                      style={{ background: c.value }}
                    />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={duplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={reset}>
              <Eraser className="mr-2 h-4 w-4" />
              Reset formatting
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={remove}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}

export default BlockMenu;
