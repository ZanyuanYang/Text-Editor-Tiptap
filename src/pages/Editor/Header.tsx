import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, Keyboard, Pencil, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDocuments } from '@/contexts/documents_context';
import { cn } from '@/lib/utils';
import { ExportMenu } from './ExportMenu';
import { ThemeToggle } from './ThemeToggle';

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

export function Header({
  editor,
  readOnly,
  setReadOnly,
  onOpenSidebar,
}: {
  editor: TiptapEditor | null;
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
  onOpenSidebar: () => void;
}) {
  const { activeDoc, renameDocument, toggleStar } = useDocuments();
  const [title, setTitle] = useState(activeDoc?.title ?? '');

  useEffect(() => {
    setTitle(activeDoc?.title ?? '');
  }, [activeDoc?.id, activeDoc?.title]);

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b bg-background sticky top-0 z-10">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-8 w-8"
        aria-label="Open sidebar"
        onClick={onOpenSidebar}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="text-base">{activeDoc?.emoji ?? '📝'}</span>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() =>
          activeDoc && renameDocument(activeDoc.id, title.trim() || 'Untitled')
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        placeholder="Untitled"
        readOnly={readOnly}
        className="h-8 flex-1 min-w-0 max-w-md border-none shadow-none focus-visible:ring-0 px-1 text-base font-semibold"
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={activeDoc?.starred ? 'Unstar' : 'Star'}
        title={activeDoc?.starred ? 'Unstar' : 'Star'}
        onClick={() => activeDoc && toggleStar(activeDoc.id)}
        className="h-7 w-7"
      >
        <Star
          className={cn(
            'h-4 w-4',
            activeDoc?.starred && 'fill-yellow-400 text-yellow-500'
          )}
        />
      </Button>
      <SaveIndicator />
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label={readOnly ? 'Switch to edit mode' : 'Switch to read-only'}
          title={readOnly ? 'Edit' : 'Read-only'}
          onClick={() => setReadOnly(!readOnly)}
          className={cn(readOnly && 'bg-accent')}
        >
          {readOnly ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Keyboard className="h-4 w-4" />
          )}
        </Button>
        <ExportMenu doc={activeDoc} editor={editor} />
        <ThemeToggle />
      </div>
    </header>
  );
}

export default Header;
