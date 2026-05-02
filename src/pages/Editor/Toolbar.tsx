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
    'inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition disabled:opacity-50 disabled:pointer-events-none',
    active && 'bg-accent text-accent-foreground'
  );

export function Toolbar({ editor }: { editor: TiptapEditor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 border-b bg-background/60 backdrop-blur sticky top-[49px] z-10">
      <button
        className={btn(false)}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
      >
        <Undo2 className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 className="h-4 w-4" />
      </button>
      <span className="mx-1 h-5 w-px bg-border" />

      <button
        className={btn(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (⌘B)"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (⌘I)"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('underline'))}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline (⌘U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('strike'))}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('code'))}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Code"
      >
        <CodeIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('highlight'))}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
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
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <span className="text-xs font-semibold">H1</span>
      </button>
      <button
        className={btn(editor.isActive('heading', { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <span className="text-xs font-semibold">H2</span>
      </button>
      <button
        className={btn(editor.isActive('heading', { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <span className="text-xs font-semibold">H3</span>
      </button>

      <span className="mx-1 h-5 w-px bg-border" />
      <button
        className={btn(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <ListIcon className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('taskList'))}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        title="Task list"
      >
        <ListTodo className="h-4 w-4" />
      </button>
      <button
        className={btn(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </button>

      <span className="mx-1 h-5 w-px bg-border" />
      <button
        className={btn(false)}
        onClick={() =>
          editor.chain().focus().sinkListItem('listItem').run() ||
          editor.chain().focus().sinkListItem('taskItem').run()
        }
        title="Indent (Tab)"
      >
        <Indent className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() =>
          editor.chain().focus().liftListItem('listItem').run() ||
          editor.chain().focus().liftListItem('taskItem').run()
        }
        title="Outdent (⇧Tab)"
      >
        <Outdent className="h-4 w-4" />
      </button>
      <button
        className={btn(false)}
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
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
                editor.chain().focus().toggleHighlight({ color: c.value }).run()
              }
              className="h-7 w-7 rounded border hover:scale-110 transition"
              style={{ background: c.value }}
            />
          ))}
          <button
            type="button"
            title="Remove"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
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
                if (!f.value) editor.chain().focus().unsetFontFamily().run();
                else editor.chain().focus().setFontFamily(f.value).run();
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
          editor.chain().focus().setBlockMath(latex).run();
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
          editor
            .chain()
            .focus()
            .setColor((e.target as HTMLInputElement).value)
            .run()
        }
        value={(editor.getAttributes('textStyle').color as string) ?? '#000000'}
      />
    </div>
  );
}

export default Toolbar;
