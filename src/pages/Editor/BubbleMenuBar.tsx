import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Bold,
  ChevronDown,
  Code as CodeIcon,
  Eraser,
  Highlighter,
  Italic,
  Link as LinkIcon,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LinkPopover } from './LinkPopover';

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

function currentTypeLabel(editor: Editor): string {
  if (editor.isActive('heading', { level: 1 })) return 'H1';
  if (editor.isActive('heading', { level: 2 })) return 'H2';
  if (editor.isActive('heading', { level: 3 })) return 'H3';
  if (editor.isActive('blockquote')) return 'Quote';
  if (editor.isActive('codeBlock')) return 'Code';
  if (editor.isActive('bulletList')) return 'List';
  if (editor.isActive('orderedList')) return 'Numbered';
  if (editor.isActive('taskList')) return 'Todo';
  return 'Text';
}

const markBtn = (active: boolean) =>
  cn(
    'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent transition',
    active && 'bg-accent'
  );

export function BubbleMenuBar({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({
        editor: ed,
        from,
        to,
      }: {
        editor: Editor;
        from: number;
        to: number;
      }) => {
        if (from === to) return false;
        if (ed.isActive('codeBlock') || ed.isActive('image')) return false;
        return true;
      }}
    >
      <div className="flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-md">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-7 px-2 inline-flex items-center gap-1 rounded text-xs font-medium hover:bg-accent"
              title="Turn into"
            >
              {currentTypeLabel(editor)}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {TURN_INTO.map((t) => (
              <DropdownMenuItem key={t.label} onClick={() => t.run(editor)}>
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-0.5 h-5 w-px bg-border" />

        <button
          type="button"
          className={markBtn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={markBtn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={markBtn(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (⌘U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={markBtn(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={markBtn(editor.isActive('code'))}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code"
        >
          <CodeIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={markBtn(editor.isActive('highlight'))}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <Highlighter className="h-3.5 w-3.5" />
        </button>

        <LinkPopover
          editor={editor}
          align="start"
          trigger={
            <button
              type="button"
              className={markBtn(editor.isActive('link'))}
              title="Link (⌘K)"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
          }
        />

        <span className="mx-0.5 h-5 w-px bg-border" />
        <button
          type="button"
          className={markBtn(false)}
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <Eraser className="h-3.5 w-3.5" />
        </button>
      </div>
    </BubbleMenu>
  );
}

export default BubbleMenuBar;
