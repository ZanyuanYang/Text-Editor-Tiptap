import { useContext, useRef, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDocuments } from '@/contexts/documents_context';
import { GlobalContext } from '@/contexts/global_context';
import { useTheme } from '@/hooks/useTheme';
import { jsonToMarkdown, downloadFile } from '@/lib/markdown';
import { TEMPLATES } from '@/lib/templates';
import {
  COMMON_EMOJIS,
  FONT_FAMILIES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from './constants';

const SPECIAL_CHARS = [
  '©',
  '®',
  '™',
  '§',
  '¶',
  '†',
  '‡',
  '•',
  '·',
  '°',
  '′',
  '″',
  '€',
  '£',
  '¥',
  '¢',
  '±',
  '×',
  '÷',
  '≈',
  '≠',
  '≤',
  '≥',
  '∞',
  '→',
  '←',
  '↑',
  '↓',
  '↔',
  '⇒',
  '⇐',
  '⇔',
  '★',
  '☆',
  '♠',
  '♣',
  '♥',
  '♦',
  '✓',
  '✗',
  '✘',
  '✦',
  '❖',
  '☀',
  '☁',
  '☂',
  '☃',
  '☎',
  '“',
  '”',
  '‘',
  '’',
  '–',
  '—',
  '…',
  '«',
  '»',
];

type Props = {
  editor: TiptapEditor | null;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
  onOpenFind: () => void;
  onOpenPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenCover: () => void;
  showToolbar: boolean;
  setShowToolbar: (v: boolean) => void;
  zoom: number;
  setZoom: (n: number) => void;
};

export function MenuBar(props: Props) {
  const {
    editor,
    readOnly,
    setReadOnly,
    onOpenFind,
    onOpenPalette,
    onOpenShortcuts,
    onOpenCover,
    showToolbar,
    setShowToolbar,
    zoom,
    setZoom,
  } = props;

  const {
    activeDoc,
    createDocument,
    duplicateDocument,
    deleteDocument,
    renameDocument,
    setEmoji,
    setCover,
    toggleStar,
  } = useDocuments();
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [wordCountOpen, setWordCountOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [specialCharsOpen, setSpecialCharsOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  if (!editor) return null;

  const focus = () => editor.chain().focus();

  const insertText = (text: string) => focus().insertContent(text).run();
  const insertParagraph = (text: string) =>
    focus()
      .insertContent({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })
      .run();

  const onPickDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      focus().insertContent(result.value).run();
    } catch {
      setError('.docx only — failed to convert');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const exportMd = () => {
    if (!activeDoc) return;
    const md = `# ${activeDoc.title}\n\n${jsonToMarkdown(activeDoc.content)}`;
    downloadFile(`${activeDoc.title || 'untitled'}.md`, md, 'text/markdown');
  };
  const exportHtml = () => {
    if (!activeDoc) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${activeDoc.title}</title></head><body>${editor.getHTML()}</body></html>`;
    downloadFile(`${activeDoc.title || 'untitled'}.html`, html, 'text/html');
  };
  const exportTxt = () => {
    if (!activeDoc) return;
    const txt = editor.getText();
    downloadFile(`${activeDoc.title || 'untitled'}.txt`, txt, 'text/plain');
  };
  const exportJson = () => {
    if (!activeDoc) return;
    const json = JSON.stringify(
      { ...activeDoc, content: editor.getJSON() },
      null,
      2
    );
    downloadFile(
      `${activeDoc.title || 'untitled'}.json`,
      json,
      'application/json'
    );
  };
  const copyMd = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(jsonToMarkdown(activeDoc.content));
  };
  const copyHtml = () => {
    navigator.clipboard.writeText(editor.getHTML());
  };

  const handleRename = () => {
    if (!activeDoc) return;
    const next = window.prompt('Rename document', activeDoc.title);
    if (next != null && next.trim()) {
      renameDocument(activeDoc.id, next.trim());
    }
  };

  const handleSetEmoji = () => {
    if (!activeDoc) return;
    const next = window.prompt(
      'Set emoji (paste any emoji)',
      activeDoc.emoji ?? '📝'
    );
    if (next && next.trim()) setEmoji(activeDoc.id, next.trim());
  };

  const handleDelete = () => {
    if (!activeDoc) return;
    if (window.confirm(`Move "${activeDoc.title}" to trash?`)) {
      deleteDocument(activeDoc.id);
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt('Image URL (or leave empty to upload)');
    if (url) {
      focus().setImage({ src: url }).run();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleInsertLink = () => {
    const prev =
      (editor.getAttributes('link').href as string | undefined) ?? '';
    const url = window.prompt('Link URL', prev);
    if (url == null) return;
    if (!url) {
      focus().unsetLink().run();
      return;
    }
    focus().setLink({ href: url }).run();
  };

  const handleInsertTable = () => {
    focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleInsertYoutube = () => {
    const url = window.prompt('YouTube URL');
    if (!url) return;
    focus().setYoutubeVideo({ src: url }).run();
  };

  const handleInsertMath = () => {
    const latex = window.prompt('LaTeX (e.g. E = mc^2)');
    if (!latex) return;
    focus().setBlockMath(latex).run();
  };

  const handleInsertInlineMath = () => {
    const latex = window.prompt('Inline LaTeX');
    if (!latex) return;
    focus().setInlineMath(latex).run();
  };

  const insertDate = () => insertText(new Date().toLocaleDateString());
  const insertTime = () => insertText(new Date().toLocaleTimeString());
  const insertDateTime = () => insertText(new Date().toLocaleString());

  const insertPageBreak = () => {
    focus().insertContent('<div style="page-break-after: always"></div>').run();
  };

  const insertSignatureLine = () => {
    insertParagraph('________________________');
  };

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) =>
    focus().toggleHeading({ level }).run();

  const setLineHeight = (lh: string) => {
    const el = document.querySelector('.ProseMirror') as HTMLElement | null;
    if (el) el.style.lineHeight = lh;
  };

  const transformSelection = (fn: (s: string) => string) => {
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const text = editor.state.doc.textBetween(from, to, ' ');
    focus().insertContentAt({ from, to }, fn(text)).run();
  };

  const upper = () => transformSelection((s) => s.toUpperCase());
  const lower = () => transformSelection((s) => s.toLowerCase());
  const titleCase = () =>
    transformSelection((s) =>
      s.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
    );
  const sentenceCase = () =>
    transformSelection((s) => {
      const lo = s.toLowerCase();
      return lo.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
    });

  const pasteAsPlain = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) insertText(text);
    } catch {
      setError('Clipboard access denied');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 2500);
    }
  };

  const cc = editor.storage.characterCount as
    | { words: () => number; characters: () => number }
    | undefined;
  const words = cc?.words?.() ?? 0;
  const chars = cc?.characters?.() ?? 0;
  const charsNoSpace = editor.getText().replace(/\s/g, '').length;
  const sentences = editor
    .getText()
    .split(/[.!?]+\s/)
    .filter((s) => s.trim()).length;
  const paragraphs = editor
    .getText()
    .split(/\n\n+/)
    .filter((s) => s.trim()).length;
  const readingMins = Math.max(1, Math.ceil(words / 200));

  return (
    <>
      <Menubar className="h-8 border-0 rounded-none bg-transparent p-0 px-2 gap-0">
        {/* FILE */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            File
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>New</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => createDocument()}>
                  Blank document
                  <MenubarShortcut>⌘⇧N</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                {TEMPLATES.map((t) => (
                  <MenubarItem
                    key={t.id}
                    onClick={() => createDocument(t.build())}
                  >
                    <span className="mr-2">{t.emoji}</span>
                    {t.name}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem onClick={onOpenPalette}>
              Open
              <MenubarShortcut>⌘K</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => activeDoc && duplicateDocument(activeDoc.id)}
            >
              Make a copy
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleRename}>Rename…</MenubarItem>
            <MenubarItem onClick={() => activeDoc && toggleStar(activeDoc.id)}>
              {activeDoc?.starred ? 'Remove star' : 'Add star'}
            </MenubarItem>
            <MenubarItem onClick={handleSetEmoji}>Set emoji…</MenubarItem>
            <MenubarItem onClick={onOpenCover}>
              {activeDoc?.coverUrl ? 'Change cover image…' : 'Add cover image…'}
            </MenubarItem>
            {activeDoc?.coverUrl && (
              <MenubarItem
                onClick={() => activeDoc && setCover(activeDoc.id, null)}
              >
                Remove cover image
              </MenubarItem>
            )}
            <MenubarSeparator />
            <MenubarItem onClick={() => fileInputRef.current?.click()}>
              Import .docx…
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Download</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={exportMd}>Markdown (.md)</MenubarItem>
                <MenubarItem onClick={exportHtml}>HTML (.html)</MenubarItem>
                <MenubarItem onClick={exportTxt}>Plain text (.txt)</MenubarItem>
                <MenubarItem onClick={exportJson}>JSON (.json)</MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => window.print()}>
                  PDF (Print)
                  <MenubarShortcut>⌘P</MenubarShortcut>
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => window.print()}>
              Print
              <MenubarShortcut>⌘P</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleDelete} className="text-destructive">
              Move to trash
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* EDIT */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Edit
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem
              onClick={() => focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() => focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              Redo
              <MenubarShortcut>⌘⇧Z</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => document.execCommand('cut')}>
              Cut
              <MenubarShortcut>⌘X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => document.execCommand('copy')}>
              Copy
              <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => document.execCommand('paste')}>
              Paste
              <MenubarShortcut>⌘V</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={pasteAsPlain}>
              Paste without formatting
              <MenubarShortcut>⌘⇧V</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => focus().selectAll().run()}>
              Select all
              <MenubarShortcut>⌘A</MenubarShortcut>
            </MenubarItem>
            <MenubarItem
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .deleteRange({
                    from: editor.state.selection.from,
                    to: editor.state.selection.to,
                  })
                  .run()
              }
            >
              Delete selection
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onOpenFind}>
              Find
              <MenubarShortcut>⌘F</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onOpenFind}>
              Find and replace
              <MenubarShortcut>⌘⇧H</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* VIEW */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            View
          </MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              checked={showToolbar}
              onCheckedChange={setShowToolbar}
            >
              Show toolbar
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={readOnly}
              onCheckedChange={setReadOnly}
            >
              Read-only mode
            </MenubarCheckboxItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Zoom</MenubarSubTrigger>
              <MenubarSubContent>
                {[50, 75, 90, 100, 110, 125, 150, 200].map((z) => (
                  <MenubarItem key={z} onClick={() => setZoom(z / 100)}>
                    {z}%
                    {Math.round(zoom * 100) === z && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </MenubarItem>
                ))}
                <MenubarSeparator />
                <MenubarItem onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                  Zoom in
                  <MenubarShortcut>⌘+</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                  Zoom out
                  <MenubarShortcut>⌘-</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => setZoom(1)}>
                  Reset zoom
                  <MenubarShortcut>⌘0</MenubarShortcut>
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSub>
              <MenubarSubTrigger>Theme</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => setTheme('light')}>
                  Light
                  {theme === 'light' && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </MenubarItem>
                <MenubarItem onClick={() => setTheme('dark')}>
                  Dark
                  {theme === 'dark' && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </MenubarItem>
                <MenubarItem onClick={() => setTheme('system')}>
                  System
                  {theme === 'system' && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem
              onClick={() => document.documentElement.requestFullscreen?.()}
            >
              Full screen
              <MenubarShortcut>F11</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* INSERT */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Insert
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleInsertImage}>Image…</MenubarItem>
            <MenubarItem onClick={handleInsertLink}>
              Link…
              <MenubarShortcut>⌘K</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onOpenCover}>Cover image…</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleInsertTable}>Table (3×3)</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Custom table</MenubarSubTrigger>
              <MenubarSubContent>
                {[
                  [2, 2],
                  [3, 3],
                  [4, 4],
                  [5, 5],
                  [3, 5],
                  [5, 3],
                ].map(([r, c]) => (
                  <MenubarItem
                    key={`${r}x${c}`}
                    onClick={() =>
                      focus()
                        .insertTable({ rows: r, cols: c, withHeaderRow: true })
                        .run()
                    }
                  >
                    {r} × {c}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem onClick={() => focus().toggleCodeBlock().run()}>
              Code block
            </MenubarItem>
            <MenubarItem onClick={() => focus().toggleBlockquote().run()}>
              Quote
            </MenubarItem>
            <MenubarItem onClick={() => focus().setHorizontalRule().run()}>
              Horizontal divider
            </MenubarItem>
            <MenubarItem onClick={() => focus().setHardBreak().run()}>
              Line break
              <MenubarShortcut>⇧Enter</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={insertPageBreak}>Page break</MenubarItem>
            <MenubarItem onClick={insertSignatureLine}>
              Signature line
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={handleInsertYoutube}>YouTube…</MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Equation</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={handleInsertMath}>
                  Block equation
                </MenubarItem>
                <MenubarItem onClick={handleInsertInlineMath}>
                  Inline equation
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem onClick={() => insertText('@')}>
              Mention
              <MenubarShortcut>@</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarSub>
              <MenubarSubTrigger>Date / time</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={insertDate}>Today's date</MenubarItem>
                <MenubarItem onClick={insertTime}>Current time</MenubarItem>
                <MenubarItem onClick={insertDateTime}>Date & time</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>
            <MenubarItem onClick={() => setSpecialCharsOpen(true)}>
              Special character…
            </MenubarItem>
            <MenubarItem onClick={() => setEmojiPickerOpen(true)}>
              Emoji…
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* FORMAT */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Format
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Text</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => focus().toggleBold().run()}>
                  Bold
                  <MenubarShortcut>⌘B</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleItalic().run()}>
                  Italic
                  <MenubarShortcut>⌘I</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleUnderline().run()}>
                  Underline
                  <MenubarShortcut>⌘U</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleStrike().run()}>
                  Strikethrough
                  <MenubarShortcut>⌘⇧X</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleCode().run()}>
                  Inline code
                  <MenubarShortcut>⌘E</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleSuperscript().run()}>
                  Superscript
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleSubscript().run()}>
                  Subscript
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Paragraph styles</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => focus().setParagraph().run()}>
                  Normal text
                </MenubarItem>
                <MenubarSeparator />
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <MenubarItem
                    key={l}
                    onClick={() => setHeading(l as 1 | 2 | 3 | 4 | 5 | 6)}
                  >
                    Heading {l}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Align</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => focus().setTextAlign('left').run()}>
                  Left
                  <MenubarShortcut>⌘⇧L</MenubarShortcut>
                </MenubarItem>
                <MenubarItem
                  onClick={() => focus().setTextAlign('center').run()}
                >
                  Center
                  <MenubarShortcut>⌘⇧E</MenubarShortcut>
                </MenubarItem>
                <MenubarItem
                  onClick={() => focus().setTextAlign('right').run()}
                >
                  Right
                  <MenubarShortcut>⌘⇧R</MenubarShortcut>
                </MenubarItem>
                <MenubarItem
                  onClick={() => focus().setTextAlign('justify').run()}
                >
                  Justify
                  <MenubarShortcut>⌘⇧J</MenubarShortcut>
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Line spacing</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => setLineHeight('1')}>
                  Single
                </MenubarItem>
                <MenubarItem onClick={() => setLineHeight('1.15')}>
                  1.15
                </MenubarItem>
                <MenubarItem onClick={() => setLineHeight('1.5')}>
                  1.5
                </MenubarItem>
                <MenubarItem onClick={() => setLineHeight('2')}>
                  Double
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Bullets & lists</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={() => focus().toggleBulletList().run()}>
                  Bullet list
                  <MenubarShortcut>⌘⇧8</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleOrderedList().run()}>
                  Numbered list
                  <MenubarShortcut>⌘⇧7</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => focus().toggleTaskList().run()}>
                  Checklist
                  <MenubarShortcut>⌘⇧9</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem
                  onClick={() => {
                    if (!focus().sinkListItem('listItem').run()) {
                      focus().sinkListItem('taskItem').run();
                    }
                  }}
                >
                  Increase indent
                  <MenubarShortcut>Tab</MenubarShortcut>
                </MenubarItem>
                <MenubarItem
                  onClick={() => {
                    if (!focus().liftListItem('listItem').run()) {
                      focus().liftListItem('taskItem').run();
                    }
                  }}
                >
                  Decrease indent
                  <MenubarShortcut>⇧Tab</MenubarShortcut>
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Text color</MenubarSubTrigger>
              <MenubarSubContent>
                {TEXT_COLORS.map((c) => (
                  <MenubarItem
                    key={c.name}
                    onClick={() =>
                      c.value
                        ? focus().setColor(c.value).run()
                        : focus().unsetColor().run()
                    }
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded border"
                      style={{ background: c.value || 'transparent' }}
                    />
                    {c.name}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Highlight</MenubarSubTrigger>
              <MenubarSubContent>
                {HIGHLIGHT_COLORS.map((c) => (
                  <MenubarItem
                    key={c.value}
                    onClick={() =>
                      focus().toggleHighlight({ color: c.value }).run()
                    }
                  >
                    <span
                      className="mr-2 inline-block h-3 w-3 rounded border"
                      style={{ background: c.value }}
                    />
                    {c.name}
                  </MenubarItem>
                ))}
                <MenubarSeparator />
                <MenubarItem onClick={() => focus().unsetHighlight().run()}>
                  Remove highlight
                </MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Font family</MenubarSubTrigger>
              <MenubarSubContent>
                {FONT_FAMILIES.map((f) => (
                  <MenubarItem
                    key={f.name}
                    onClick={() =>
                      f.value
                        ? focus().setFontFamily(f.value).run()
                        : focus().unsetFontFamily().run()
                    }
                  >
                    <span style={{ fontFamily: f.value || 'inherit' }}>
                      {f.name}
                    </span>
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSub>
              <MenubarSubTrigger>Change case</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem onClick={upper}>UPPERCASE</MenubarItem>
                <MenubarItem onClick={lower}>lowercase</MenubarItem>
                <MenubarItem onClick={titleCase}>Title Case</MenubarItem>
                <MenubarItem onClick={sentenceCase}>Sentence case</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSeparator />
            <MenubarItem
              onClick={() => focus().clearNodes().unsetAllMarks().run()}
            >
              Clear formatting
              <MenubarShortcut>⌘\</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* TOOLS */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Tools
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setWordCountOpen(true)}>
              Word count
              <MenubarShortcut>⌘⇧C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onOpenPalette}>
              Command palette
              <MenubarShortcut>⌘K</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={onOpenFind}>
              Find & replace
              <MenubarShortcut>⌘F</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={copyMd}>Copy as Markdown</MenubarItem>
            <MenubarItem onClick={copyHtml}>Copy as HTML</MenubarItem>
            <MenubarSeparator />
            <MenubarCheckboxItem
              checked={readOnly}
              onCheckedChange={setReadOnly}
            >
              Reading mode
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={
                document
                  .querySelector('.ProseMirror')
                  ?.getAttribute('spellcheck') !== 'false'
              }
              onCheckedChange={(v) => {
                const el = document.querySelector(
                  '.ProseMirror'
                ) as HTMLElement | null;
                if (el) el.setAttribute('spellcheck', v ? 'true' : 'false');
              }}
            >
              Spelling suggestions
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        {/* EXTENSIONS */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Extensions
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Templates</MenubarSubTrigger>
              <MenubarSubContent>
                {TEMPLATES.map((t) => (
                  <MenubarItem
                    key={t.id}
                    onClick={() => createDocument(t.build())}
                  >
                    <span className="mr-2">{t.emoji}</span>
                    {t.name}
                  </MenubarItem>
                ))}
              </MenubarSubContent>
            </MenubarSub>
            <MenubarSeparator />
            <MenubarItem
              onClick={() =>
                window.open(
                  'https://tiptap.dev/docs/editor/extensions',
                  '_blank'
                )
              }
            >
              Browse Tiptap extensions ↗
            </MenubarItem>
            <MenubarItem
              onClick={() =>
                window.open(
                  'https://github.com/ZanyuanYang/Text-Editor-Tiptap',
                  '_blank'
                )
              }
            >
              View source on GitHub ↗
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* HELP */}
        <MenubarMenu>
          <MenubarTrigger className="px-2 py-1 text-sm font-normal">
            Help
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onOpenShortcuts}>
              Keyboard shortcuts
              <MenubarShortcut>⌘/</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => setAboutOpen(true)}>
              About this editor
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              onClick={() =>
                window.open(
                  'https://github.com/ZanyuanYang/Text-Editor-Tiptap/issues/new',
                  '_blank'
                )
              }
            >
              Report a bug ↗
            </MenubarItem>
            <MenubarItem
              onClick={() =>
                window.open(
                  'https://github.com/ZanyuanYang/Text-Editor-Tiptap',
                  '_blank'
                )
              }
            >
              GitHub repository ↗
            </MenubarItem>
            <MenubarItem
              onClick={() => window.open('https://tiptap.dev/docs', '_blank')}
            >
              Tiptap documentation ↗
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <input
        type="file"
        ref={fileInputRef}
        accept=".docx"
        className="hidden"
        onChange={onPickDocx}
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />

      <Dialog open={wordCountOpen} onOpenChange={setWordCountOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Word count</DialogTitle>
          </DialogHeader>
          <dl className="space-y-2 text-sm">
            <Row label="Words" value={words.toString()} />
            <Row label="Characters" value={chars.toString()} />
            <Row
              label="Characters (excluding spaces)"
              value={charsNoSpace.toString()}
            />
            <Row label="Sentences" value={sentences.toString()} />
            <Row label="Paragraphs" value={paragraphs.toString()} />
            <Row label="Reading time" value={`~${readingMins} min`} />
          </dl>
        </DialogContent>
      </Dialog>

      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>About this editor</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              An open-source, Notion-style rich text editor built with Tiptap,
              React, and shadcn/ui.
            </p>
            <p>
              Pages save to your browser's local storage. No account, no
              tracking.
            </p>
            <p>
              <a
                className="underline"
                href="https://github.com/ZanyuanYang/Text-Editor-Tiptap"
                target="_blank"
                rel="noreferrer"
              >
                github.com/ZanyuanYang/Text-Editor-Tiptap
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={specialCharsOpen} onOpenChange={setSpecialCharsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert special character</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-1.5 max-h-[50vh] overflow-auto">
            {SPECIAL_CHARS.map((ch) => (
              <button
                key={ch}
                type="button"
                className="h-9 rounded border bg-background hover:bg-accent text-base"
                onClick={() => {
                  insertText(ch);
                  setSpecialCharsOpen(false);
                }}
              >
                {ch}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert emoji</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-8 gap-1.5 max-h-[50vh] overflow-auto">
            {COMMON_EMOJIS.map((ch) => (
              <button
                key={ch}
                type="button"
                className="h-9 rounded border bg-background hover:bg-accent text-base"
                onClick={() => {
                  insertText(ch);
                  setEmojiPickerOpen(false);
                }}
              >
                {ch}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}

export default MenuBar;
