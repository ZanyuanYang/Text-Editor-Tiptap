import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import {
  Bold,
  Code as CodeIcon,
  Eraser,
  Highlighter,
  Indent,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  ListTodo,
  Outdent,
  Quote,
  Redo2,
  Sigma,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { FONT_FAMILIES, HIGHLIGHT_COLORS } from './constants';
import { LinkPopover } from './LinkPopover';

const btn = (active: boolean) =>
  cn(
    'rte-toolbar-btn relative inline-flex h-8 w-8 items-center justify-center rounded-md transition duration-200 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none',
    active ? 'is-active' : 'text-muted-foreground'
  );

export function Toolbar({ editor }: { editor: TiptapEditor | null }) {
  // Force re-render on every editor transaction so active states are updated instantly
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const handler = () => setTick((t) => t + 1);
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);

  if (!editor) return null;

  const focus = (skipFix = false) => {
    if (!skipFix) {
      const { selection, doc } = editor.state;
      if (!selection.empty && !('node' in selection)) {
        const selectedText = doc.textBetween(selection.from, selection.to);
        if (selectedText.length === 0) {
          editor.commands.setTextSelection(selection.to);
        }
      }
    } 
    return editor.chain().focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 border-b bg-background/60 backdrop-blur sticky top-[49px] z-10">
      <button
        className={btn(false)}
        onClick={() => focus(true).undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() => focus(true).redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />

      <button
        className={btn(editor.isActive('bold'))}
        onClick={() => focus().toggleBold().run()}
        title="Bold (⌘B)"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('italic'))}
        onClick={() => focus().toggleItalic().run()}
        title="Italic (⌘I)"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('underline'))}
        onClick={() => focus().toggleUnderline().run()}
        title="Underline (⌘U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('strike'))}
        onClick={() => focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('code'))}
        onClick={() => focus().toggleCode().run()}
        title="Code"
      >
        <CodeIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('highlight'))}
        onClick={() => focus().toggleHighlight().run()}
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </button>

      <LinkPopover
        editor={editor}
        align="start"
        trigger={
          <button className={btn(editor.isActive('link'))} title="Link (⌘K)">
            <LinkIcon className="h-4 w-4" />
          </button>
        }
      />

      <span className="mx-1 h-5 w-px bg-border" />
      <button
        className={btn(editor.isActive('heading', { level: 1 }))}
        onClick={() => focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <span className="text-xs font-semibold">H1</span>
      </button>
      <button
        className={btn(editor.isActive('heading', { level: 2 }))}
        onClick={() => focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <span className="text-xs font-semibold">H2</span>
      </button>
      <button
        className={btn(editor.isActive('heading', { level: 3 }))}
        onClick={() => focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <span className="text-xs font-semibold">H3</span>
      </button>

      <span className="mx-1 h-5 w-px bg-border" />
      <button
        className={btn(editor.isActive('bulletList'))}
        onClick={() => focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('orderedList'))}
        onClick={() => focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('taskList'))}
        onClick={() => focus().toggleTaskList().run()}
        title="Task list"
      >
        <ListTodo className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('blockquote'))}
        onClick={() => focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-border" />
      <button
        className={btn(false)}
        onClick={() =>
          focus().sinkListItem('listItem').run() ||
          focus().sinkListItem('taskItem').run()
        }
        title="Indent (Tab)"
      >
        <Indent className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() =>
          focus().liftListItem('listItem').run() ||
          focus().liftListItem('taskItem').run()
        }
        title="Outdent (⇧Tab)"
      >
        <Outdent className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() =>
          focus().clearNodes().unsetAllMarks().run()
        }
        title="Clear formatting"
      >
        <Eraser className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-border" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={btn(editor.isActive('highlight'))}
            title="Highlight color"
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="grid grid-cols-3 gap-1 p-2 w-auto"
        >
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              onClick={() =>
                focus().toggleHighlight({ color: c.value }).run()
              }
              className="h-7 w-7 rounded border hover:scale-110 transition"
              style={{ background: c.value }}
            />
          ))}
          <button
            type="button"
            title="Remove"
            onClick={() => focus().unsetHighlight().run()}
            className="h-7 w-7 rounded border bg-background flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={btn(false)} title="Font family">
            <span className="text-xs font-semibold">Aa</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {FONT_FAMILIES.map((f) => (
            <DropdownMenuItem
              key={f.name}
              onClick={() => {
                if (!f.value) focus().unsetFontFamily().run();
                else focus().setFontFamily(f.value).run();
              }}
            >
              <span style={{ fontFamily: f.value || 'inherit' }}>{f.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        className={btn(false)}
        onClick={() => {
          const latex = window.prompt('LaTeX (e.g. E = mc^2)');
          if (!latex) return;
          focus().setBlockMath(latex).run();
        }}
        title="Math equation"
      >
        <Sigma className="h-4 w-4" />
      </button>

      <input
        type="color"
        className="h-7 w-7 cursor-pointer rounded border bg-transparent"
        title="Text color"
        onInput={(e) =>
          focus()
            .setColor((e.target as HTMLInputElement).value)
            .run()
        }
        value={(editor.getAttributes('textStyle').color as string) ?? '#000000'}
      />
    </div>
  );
}

export default Toolbar;
