import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDocuments } from '@/contexts/documents_context';
import { TEMPLATES } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { COMMON_EMOJIS } from './constants';

export function Sidebar({
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
    toggleStar,
    renameDocument,
  } = useDocuments();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [search, setSearch] = useState('');

  const visibleIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orderedIds;
    return orderedIds.filter((id) =>
      (documents[id]?.title ?? '').toLowerCase().includes(q)
    );
  }, [orderedIds, documents, search]);

  const starredIds = useMemo(
    () => visibleIds.filter((id) => documents[id]?.starred),
    [visibleIds, documents]
  );
  const otherIds = useMemo(
    () => visibleIds.filter((id) => !documents[id]?.starred),
    [visibleIds, documents]
  );

  const renderRow = (id: string) => {
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

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(id);
          }}
          className={cn(
            'p-0.5 rounded hover:bg-background transition',
            doc.starred
              ? 'opacity-100 text-yellow-500'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground'
          )}
          aria-label={doc.starred ? 'Unstar' : 'Star'}
        >
          <Star
            className={cn('h-3.5 w-3.5', doc.starred && 'fill-yellow-400')}
          />
        </button>

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
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              onClick={() => {
                setRenamingId(id);
                setDraftTitle(doc.title);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStar(id)}>
              <Star className="mr-2 h-4 w-4" />
              {doc.starred ? 'Unstar' : 'Star'}
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
  };

  if (collapsed) {
    return (
      <aside className="w-10 shrink-0 border-r bg-muted/30 flex flex-col items-center py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label="Expand sidebar"
        >
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="New page"
                className="h-7 w-7"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
                New from template
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TEMPLATES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => createDocument(t.build())}
                >
                  <span className="mr-2 text-base">{t.emoji}</span>
                  <span className="flex flex-col">
                    <span className="text-sm">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.description}
                    </span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="px-2 pt-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full h-7 pl-7 pr-2 text-xs rounded-md border bg-background outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-auto p-2 space-y-0.5">
        {orderedIds.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-4">
            No pages yet. Click + to create one.
          </p>
        )}
        {orderedIds.length > 0 && visibleIds.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-4">
            No pages match "{search}".
          </p>
        )}

        {starredIds.length > 0 && (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-1">
            ⭐ Starred
          </div>
        )}
        {starredIds.map((id) => renderRow(id))}

        {otherIds.length > 0 && starredIds.length > 0 && (
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
            All pages
          </div>
        )}
        {otherIds.map((id) => renderRow(id))}
      </nav>
      <div className="px-3 py-2 border-t text-[11px] text-muted-foreground">
        {orderedIds.length} page{orderedIds.length === 1 ? '' : 's'}
      </div>
    </aside>
  );
}

export default Sidebar;
