import { useContext, useEffect, useState } from 'react';

import { EditorContent } from '@tiptap/react';

import { useDocuments } from '@/contexts/documents_context';
import { TiptapContext, TiptapProvider } from '@/contexts/tiptap_context';
import { GlobalContext } from '@/contexts/global_context';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';

import CommandPalette from './CommandPalette';
import CoverImageDialog from './CoverImageDialog';
import EditorMenus from './EditorMenus';
import FindReplace from './FindReplace';
import Header from './Header';
import MenuBar from './MenuBar';
import RightPanel from './RightPanel';
import ShortcutsDialog from './ShortcutsDialog';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import Toolbar from './Toolbar';

function EditorShell() {
  const { editor } = useContext(TiptapContext);
  const { activeDoc, setCover } = useDocuments();
  const { alertOpen } = useContext(GlobalContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'k' && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        const inInput =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement;
        if (inInput) return;
        e.preventDefault();
        setPaletteOpen(true);
      } else if (key === 'f' && !e.shiftKey) {
        e.preventDefault();
        setFindOpen(true);
      } else if (key === 'h' && e.shiftKey) {
        e.preventDefault();
        setFindOpen(true);
      } else if (key === '/') {
        e.preventDefault();
        setShortcutsOpen(true);
      } else if (key === '=' || key === '+') {
        e.preventDefault();
        setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
      } else if (key === '-') {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
      } else if (key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden md:flex">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-foreground/30"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <main className="flex-1 flex flex-col min-w-0">
        <Header
          editor={editor}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          onOpenSidebar={() => setMobileOpen(true)}
        />
        <MenuBar
          editor={editor}
          readOnly={readOnly}
          setReadOnly={setReadOnly}
          onOpenFind={() => setFindOpen(true)}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenCover={() => setCoverDialogOpen(true)}
          showToolbar={showToolbar}
          setShowToolbar={setShowToolbar}
          zoom={zoom}
          setZoom={setZoom}
        />
        {!readOnly && showToolbar && <Toolbar editor={editor} />}
        <div className="flex-1 overflow-auto" id="editor-print-root">
          {activeDoc?.coverUrl && (
            <div className="w-full h-44 sm:h-56 overflow-hidden">
              <img
                src={activeDoc.coverUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget.parentElement as HTMLElement).style.display =
                    'none';
                }}
              />
            </div>
          )}
          <div
            className="mx-auto max-w-3xl"
            style={{
              zoom,
            }}
          >
            <EditorContent editor={editor} />
          </div>
          <EditorMenus editor={editor} />
        </div>
        <StatusBar editor={editor} />
      </main>
      <RightPanel editor={editor} />

      <FindReplace
        editor={editor}
        open={findOpen}
        onClose={() => setFindOpen(false)}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onToggleFind={() => setFindOpen(true)}
        onToggleShortcuts={() => setShortcutsOpen(true)}
        onPrint={() => window.print()}
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {activeDoc && (
        <CoverImageDialog
          open={coverDialogOpen}
          onOpenChange={setCoverDialogOpen}
          initialUrl={activeDoc.coverUrl ?? null}
          onSave={(url) => setCover(activeDoc.id, url)}
          onRemove={() => setCover(activeDoc.id, null)}
        />
      )}

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
