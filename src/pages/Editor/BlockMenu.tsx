import { useState } from 'react';
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
import { HIGHLIGHT_COLORS, TEXT_COLORS } from './constants';

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

export function BlockMenu({ editor }: { editor: Editor }) {
  const [current, setCurrent] = useState<Current>({ node: null, pos: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  const focusBlock = () => {
    if (!current.node) return;
    editor.chain().focus().setNodeSelection(current.pos).run();
  };

  const onPlus = () => {
    if (!current.node) {
      editor.chain().focus().insertContent('/').run();
      return;
    }
    const insertAt = current.pos + current.node.nodeSize;
    editor
      .chain()
      .focus()
      .insertContentAt(insertAt, { type: 'paragraph' })
      .setTextSelection(insertAt + 1)
      .insertContent('/')
      .run();
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

  return (
    <DragHandle
      editor={editor}
      nested
      onNodeChange={({ node, pos }) => setCurrent({ node, pos })}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPlus}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Insert block below"
          title="Click to add block below"
          className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
        </button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Block actions"
              title="Drag to move · Click to open menu"
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
