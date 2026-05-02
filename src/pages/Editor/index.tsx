import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  EditorContent,
  type Editor as TiptapEditor,
} from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Code as CodeIcon,
  Copy,
  Download,
  FileDown,
  FileUp,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  ListTodo,
  Monitor,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Quote,
  Redo2,
  Strikethrough,
  Sun,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDocuments } from '@/contexts/documents_context';
import { TiptapContext, TiptapProvider } from '@/contexts/tiptap_context';
import { GlobalContext } from '@/contexts/global_context';
import { useTheme } from '@/hooks/useTheme';
import { jsonToMarkdown, downloadFile } from '@/lib/markdown';
import type { Document, ThreadType } from '@/lib/types';
import { cn } from '@/lib/utils';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';

const COMMON_EMOJIS = [
  '📝', '📄', '📚', '📌', '📔',
  '🗒️', '🗂️', '✨', '💡', '🚀',
  '🎯', '🧠', '🛠️', '🐛', '🌱',
  '🔥', '⭐', '👋', '☕', '🎨',
];

function getHeadings(doc: Document): { id: string; text: string; level: number }[] {
  const out: { id: string; text: string; level: number }[] = [];
  let counter = 0;
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    const n = node as { type?: string; attrs?: { level?: number }; content?: unknown[] };
    if (n.type === 'heading') {
      const text = (n.content ?? [])
        .map((c) => (c as { text?: string }).text ?? '')
        .join('');
      counter += 1;
      out.push({
        id: `h-${counter}`,
        text: text || 'Untitled heading',
        level: n.attrs?.level ?? 1,
      });
    }
    if (n.content) {
      for (const child of n.content) walk(child);
    }
  }
  walk(doc.content);
  return out;
}

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const {
    orderedIds,
    documents,
    activeId,
    createDocument,
    deleteDocument,
    duplicateDocument,
    setActive,
    setEmoji,
    renameDocument,
  } = useDocuments();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  if (collapsed) {
    return (
      <aside className="w-10 shrink-0 border-r bg-muted/30 flex flex-col items-center py-3">
        <Button variant="ghost" size="icon" onClick={onToggle} aria-label="Expand sidebar">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r bg-muted/30 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <span className="text-sm font-semibold tracking-tight">Pages</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => createDocument()}
            aria-label="New page"
            className="h-7 w-7"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <nav className="flex-1 overflow-auto p-2 space-y-0.5">
        {orderedIds.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-4">
            No pages yet. Click + to create one.
          </p>
        )}
        {orderedIds.map((id) => {
          const doc = documents[id];
          if (!doc) return null;
          const isActive = id === activeId;
          const isRenaming = renamingId === id;
          return (
            <div
              key={id}
              className={cn(
                'group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer',
                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'
              )}
              onClick={() => !isRenaming && setActive(id)}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="text-base leading-none -ml-0.5 hover:scale-110 transition"
                    aria-label="Change emoji"
                  >
                    {doc.emoji}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="grid grid-cols-5 gap-1 p-2 w-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {COMMON_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      className="p-1 text-xl hover:bg-accent rounded"
                      onClick={() => setEmoji(id, em)}
                    >
                      {em}
                    </button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {isRenaming ? (
                <input
                  autoFocus
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={() => {
                    renameDocument(id, draftTitle.trim() || 'Untitled');
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      renameDocument(id, draftTitle.trim() || 'Untitled');
                      setRenamingId(null);
                    }
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 bg-transparent outline-none border-b border-ring text-sm"
                />
              ) : (
                <span className="flex-1 truncate">{doc.title || 'Untitled'}</span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-background"
                    aria-label="Page options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setRenamingId(id);
                      setDraftTitle(doc.title);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateDocument(id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete "${doc.title}"? This cannot be undone.`)) {
                        deleteDocument(id);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </nav>
      <div className="px-3 py-2 border-t text-[11px] text-muted-foreground">
        {orderedIds.length} page{orderedIds.length === 1 ? '' : 's'}
      </div>
    </aside>
  );
}

function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme();
  const Icon = resolved === 'dark' ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Theme">
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ImportItem() {
  const { editor } = useContext(TiptapContext);
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const buf = await file.arrayBuffer();
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      editor.chain().focus().insertContent(result.value).run();
    } catch {
      setError('.docx only — failed to convert');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".docx"
        className="hidden"
        onChange={onFile}
      />
      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
        <FileUp className="mr-2 h-4 w-4" />
        Import .docx
      </DropdownMenuItem>
    </>
  );
}

function ExportMenu({ doc, editor }: { doc: Document | null; editor: TiptapEditor | null }) {
  const exportMd = () => {
    if (!doc) return;
    const md = `# ${doc.title}\n\n${jsonToMarkdown(doc.content)}`;
    downloadFile(`${doc.title || 'untitled'}.md`, md, 'text/markdown');
  };
  const exportHtml = () => {
    if (!doc || !editor) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
      doc.title
    }</title></head><body>${editor.getHTML()}</body></html>`;
    downloadFile(`${doc.title || 'untitled'}.html`, html, 'text/html');
  };
  const copyMd = () => {
    if (!doc) return;
    navigator.clipboard.writeText(jsonToMarkdown(doc.content));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Export">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export / Import</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportMd}>
          <FileDown className="mr-2 h-4 w-4" />
          Download .md
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportHtml}>
          <FileDown className="mr-2 h-4 w-4" />
          Download .html
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyMd}>
          <Copy className="mr-2 h-4 w-4" />
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ImportItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SaveIndicator() {
  const { saveState, lastSavedAt } = useDocuments();
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);
  if (saveState === 'saving') {
    return <span className="text-xs text-muted-foreground">Saving…</span>;
  }
  if (lastSavedAt) {
    return (
      <span className="text-xs text-muted-foreground">
        Saved {formatDistanceToNow(lastSavedAt, { addSuffix: true })}
      </span>
    );
  }
  return null;
}

function Header({ editor }: { editor: TiptapEditor | null }) {
  const { activeDoc, renameDocument } = useDocuments();
  const [title, setTitle] = useState(activeDoc?.title ?? '');

  useEffect(() => {
    setTitle(activeDoc?.title ?? '');
  }, [activeDoc?.id, activeDoc?.title]);

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b bg-background sticky top-0 z-10">
      <span className="text-base">{activeDoc?.emoji ?? '📝'}</span>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => activeDoc && renameDocument(activeDoc.id, title.trim() || 'Untitled')}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder="Untitled"
        className="h-8 max-w-md border-none shadow-none focus-visible:ring-0 px-1 text-base font-semibold"
      />
      <SaveIndicator />
      <div className="ml-auto flex items-center gap-1">
        <ExportMenu doc={activeDoc} editor={editor} />
        <ThemeToggle />
      </div>
    </header>
  );
}

function Toolbar({ editor }: { editor: TiptapEditor | null }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn(
      'inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition disabled:opacity-50 disabled:pointer-events-none',
      active && 'bg-accent text-accent-foreground'
    );

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

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
      <button
        className={btn(editor.isActive('link'))}
        onClick={setLink}
        title="Link (⌘K)"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
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

function CreateThreadDialog({ editor }: { editor: TiptapEditor | null }) {
  const { activeId, activeDoc, updateThreads } = useDocuments();
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingRange, setPendingRange] = useState<{ from: number; to: number } | null>(
    null
  );

  const onOpen = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) {
      setError('Select some text first to attach a thread.');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
      return;
    }
    setPendingRange({ from, to });
    setOpen(true);
  };

  const onCreate = () => {
    if (!editor || !activeId || !activeDoc || !pendingRange) return;
    const id = `thread-${Date.now()}`;
    const next: ThreadType = {
      id,
      username: 'You',
      description: description.trim(),
      expanded: true,
      resolved: false,
      date: new Date().toISOString(),
      range: pendingRange,
    };
    editor
      .chain()
      .focus()
      .setTextSelection(pendingRange)
      .setMark('thread', { id })
      .run();
    updateThreads(activeId, [...activeDoc.threads, next]);
    setOpen(false);
    setDescription('');
    setPendingRange(null);
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1 w-full" onClick={onOpen}>
        <Plus className="h-3.5 w-3.5" />
        Add thread
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create thread</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="What's on your mind?"
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} disabled={!description.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ThreadPanel({ editor }: { editor: TiptapEditor | null }) {
  const { activeId, activeDoc, updateThreads } = useDocuments();
  const threads = activeDoc?.threads ?? [];

  const setThreads = useCallback(
    (next: ThreadType[]) => {
      if (!activeId) return;
      updateThreads(activeId, next);
    },
    [activeId, updateThreads]
  );

  const onClick = (id: string) => {
    const t = threads.find((x) => x.id === id);
    if (t?.range && editor) {
      try {
        editor.commands.setTextSelection(t.range);
        editor.commands.scrollIntoView();
      } catch {
        /* range may be out of doc bounds; ignore */
      }
    }
    setThreads(threads.map((x) => ({ ...x, expanded: x.id === id ? !x.expanded : false })));
  };
  const onResolve = (id: string, resolved: boolean) => {
    setThreads(threads.map((x) => (x.id === id ? { ...x, resolved } : x)));
  };
  const onDelete = (id: string) => {
    setThreads(threads.filter((x) => x.id !== id));
    if (editor) {
      const ed = editor as TiptapEditor & {
        commands: { unsetThreadById: (id: string) => boolean };
      };
      ed.commands.unsetThreadById(id);
    }
  };

  const open = threads.filter((t) => !t.resolved);
  const resolved = threads.filter((t) => t.resolved);

  if (threads.length === 0) {
    return (
      <p className="text-xs text-muted-foreground p-3">
        No threads yet. Select text and click "Add thread".
      </p>
    );
  }

  return (
    <div className="space-y-3 p-2">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
          Open ({open.length})
        </div>
        {open.map((t) => (
          <ThreadCard
            key={t.id}
            thread={t}
            onClick={onClick}
            onResolve={onResolve}
            onDelete={onDelete}
          />
        ))}
      </div>
      {resolved.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
            Resolved ({resolved.length})
          </div>
          {resolved.map((t) => (
            <ThreadCard
              key={t.id}
              thread={t}
              onClick={onClick}
              onResolve={onResolve}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadCard({
  thread,
  onClick,
  onResolve,
  onDelete,
}: {
  thread: ThreadType;
  onClick: (id: string) => void;
  onResolve: (id: string, r: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(thread.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(thread.id);
      }}
      className={cn(
        'rounded-md border p-2 mb-1 text-sm cursor-pointer transition',
        thread.expanded ? 'border-ring' : 'hover:border-foreground/20'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-xs">{thread.username}</span>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(thread.date), { addSuffix: true })}
        </span>
      </div>
      <p className="text-xs mt-1 break-words whitespace-pre-wrap">{thread.description}</p>
      {thread.expanded && (
        <div className="flex justify-end gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => onDelete(thread.id)}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => onResolve(thread.id, !thread.resolved)}
          >
            {thread.resolved ? 'Reopen' : 'Resolve'}
          </Button>
        </div>
      )}
    </div>
  );
}

function Outline({ editor, doc }: { editor: TiptapEditor | null; doc: Document | null }) {
  const headings = useMemo(() => (doc ? getHeadings(doc) : []), [doc]);

  const scrollTo = (index: number) => {
    if (!editor) return;
    let count = 0;
    let pos = 0;
    editor.state.doc.descendants((node, p) => {
      if (node.type.name === 'heading') {
        if (count === index) {
          pos = p;
          return false;
        }
        count += 1;
      }
      return true;
    });
    editor.commands.focus(pos + 1);
  };

  if (headings.length === 0) {
    return <p className="text-xs text-muted-foreground p-3">No headings in this page.</p>;
  }

  return (
    <ul className="p-2 space-y-0.5 text-sm">
      {headings.map((h, i) => (
        <li key={h.id}>
          <button
            type="button"
            onClick={() => scrollTo(i)}
            className={cn(
              'block w-full text-left rounded px-2 py-1 hover:bg-accent truncate',
              h.level === 1 && 'font-semibold',
              h.level === 2 && 'pl-4',
              h.level === 3 && 'pl-6 text-muted-foreground',
              h.level >= 4 && 'pl-8 text-muted-foreground'
            )}
            title={h.text}
          >
            {h.text}
          </button>
        </li>
      ))}
    </ul>
  );
}

function RightPanel({ editor }: { editor: TiptapEditor | null }) {
  const { activeDoc } = useDocuments();
  const [tab, setTab] = useState<'outline' | 'threads'>('outline');
  return (
    <aside className="w-72 shrink-0 border-l bg-muted/30 hidden lg:flex lg:flex-col">
      <div className="flex border-b">
        <button
          className={cn(
            'flex-1 text-xs py-2 font-medium border-b-2 transition',
            tab === 'outline'
              ? 'border-foreground'
              : 'border-transparent text-muted-foreground'
          )}
          onClick={() => setTab('outline')}
        >
          Outline
        </button>
        <button
          className={cn(
            'flex-1 text-xs py-2 font-medium border-b-2 transition',
            tab === 'threads'
              ? 'border-foreground'
              : 'border-transparent text-muted-foreground'
          )}
          onClick={() => setTab('threads')}
        >
          Threads
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === 'outline' ? (
          <Outline editor={editor} doc={activeDoc} />
        ) : (
          <ThreadPanel editor={editor} />
        )}
      </div>
      <div className="p-2 border-t">
        <CreateThreadDialog editor={editor} />
      </div>
    </aside>
  );
}

function StatusBar({ editor }: { editor: TiptapEditor | null }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => force((n) => n + 1);
    editor.on('update', onUpdate);
    editor.on('selectionUpdate', onUpdate);
    return () => {
      editor.off('update', onUpdate);
      editor.off('selectionUpdate', onUpdate);
    };
  }, [editor]);
  if (!editor) return null;
  const cc = editor.storage.characterCount as
    | { words: () => number; characters: () => number }
    | undefined;
  const words = cc?.words?.() ?? 0;
  const chars = cc?.characters?.() ?? 0;
  return (
    <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center gap-4">
      <span>
        {words} word{words === 1 ? '' : 's'}
      </span>
      <span>
        {chars} char{chars === 1 ? '' : 's'}
      </span>
      <span className="ml-auto">Tiptap Editor</span>
    </div>
  );
}

function EditorMenus({ editor }: { editor: TiptapEditor | null }) {
  if (!editor) return null;
  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor: ed, from, to }: { editor: TiptapEditor; from: number; to: number }) => {
          if (from === to) return false;
          if (ed.isActive('codeBlock') || ed.isActive('image')) return false;
          return true;
        }}
      >
        <div className="flex items-center gap-0.5 rounded-md border bg-popover p-1 shadow-md">
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('bold') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('italic') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('underline') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('strike') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strike"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('code') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
          >
            <CodeIcon className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('highlight') && 'bg-accent'
            )}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(
              'h-7 w-7 inline-flex items-center justify-center rounded hover:bg-accent',
              editor.isActive('link') && 'bg-accent'
            )}
            onClick={() => {
              const prev = editor.getAttributes('link').href as string | undefined;
              const url = window.prompt('Link URL', prev ?? 'https://');
              if (url === null) return;
              if (url === '') {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }}
            title="Link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </BubbleMenu>

      <FloatingMenu
        editor={editor}
        shouldShow={({ state }: { state: { selection: { $from: { parent: { type: { name: string }; content: { size: number } } } } } }) => {
          const { $from } = state.selection;
          return $from.parent.type.name === 'paragraph' && $from.parent.content.size === 0;
        }}
      >
        <button
          className="h-6 w-6 inline-flex items-center justify-center rounded border bg-background text-muted-foreground hover:text-foreground"
          title="Add block"
          onClick={() => editor.chain().focus().insertContent('/').run()}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </FloatingMenu>
    </>
  );
}

function EditorShell() {
  const { editor } = useContext(TiptapContext);
  const { alertOpen } = useContext(GlobalContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header editor={editor} />
        <Toolbar editor={editor} />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl">
            <EditorContent editor={editor} />
          </div>
          <EditorMenus editor={editor} />
        </div>
        <StatusBar editor={editor} />
      </main>
      <RightPanel editor={editor} />
      {alertOpen && <AlertDestructive />}
    </div>
  );
}

function EditorPage() {
  return (
    <TiptapProvider>
      <EditorShell />
    </TiptapProvider>
  );
}

export default EditorPage;
