import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Plus, Search, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDocuments } from '@/contexts/documents_context';
import { TEMPLATES } from '@/lib/templates';
import { cn } from '@/lib/utils';

type Action = {
  id: string;
  label: string;
  hint?: string;
  group: 'Pages' | 'New page' | 'Actions';
  icon: React.ReactNode;
  run: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  onToggleFind,
  onToggleShortcuts,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onToggleFind: () => void;
  onToggleShortcuts: () => void;
  onPrint: () => void;
}) {
  const { documents, orderedIds, setActive, createDocument } = useDocuments();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    if (!open) setQuery('');
  }, [open]);

  useEffect(() => setSelected(0), [query]);

  const close = () => onOpenChange(false);

  const actions = useMemo<Action[]>(() => {
    const docs: Action[] = orderedIds
      .map((id) => documents[id])
      .filter(Boolean)
      .map((d) => ({
        id: `doc:${d.id}`,
        label: `${d.emoji}  ${d.title || 'Untitled'}`,
        hint: d.starred ? 'Starred' : undefined,
        group: 'Pages',
        icon: d.starred ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground" />
        ),
        run: () => {
          setActive(d.id);
          close();
        },
      }));

    const news: Action[] = TEMPLATES.map((t) => ({
      id: `tpl:${t.id}`,
      label: t.name,
      hint: t.description,
      group: 'New page',
      icon: <span className="text-base">{t.emoji}</span>,
      run: () => {
        createDocument(t.build());
        close();
      },
    }));

    const cmds: Action[] = [
      {
        id: 'cmd:find',
        label: 'Find in page',
        hint: '⌘F',
        group: 'Actions',
        icon: <Search className="h-4 w-4 text-muted-foreground" />,
        run: () => {
          close();
          setTimeout(onToggleFind, 80);
        },
      },
      {
        id: 'cmd:print',
        label: 'Print / Export PDF',
        hint: '⌘P',
        group: 'Actions',
        icon: <FileText className="h-4 w-4 text-muted-foreground" />,
        run: () => {
          close();
          setTimeout(onPrint, 80);
        },
      },
      {
        id: 'cmd:shortcuts',
        label: 'Keyboard shortcuts',
        hint: '⌘/',
        group: 'Actions',
        icon: <Plus className="h-4 w-4 text-muted-foreground" />,
        run: () => {
          close();
          setTimeout(onToggleShortcuts, 80);
        },
      },
    ];

    return [...docs, ...news, ...cmds];
  }, [
    orderedIds,
    documents,
    setActive,
    createDocument,
    onToggleFind,
    onToggleShortcuts,
    onPrint,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) =>
      `${a.label} ${a.hint ?? ''} ${a.group}`.toLowerCase().includes(q)
    );
  }, [actions, query]);

  const grouped = useMemo(() => {
    const map: Record<string, Action[]> = {};
    for (const a of filtered) (map[a.group] ||= []).push(a);
    return map;
  }, [filtered]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (s + 1) % Math.max(1, filtered.length));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(
        (s) => (s - 1 + filtered.length) % Math.max(1, filtered.length)
      );
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selected]?.run();
    }
  };

  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 top-[20%] translate-y-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 px-3 py-2 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a page, template, or command…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="hidden sm:inline rounded border bg-muted px-1.5 py-0.5 text-[10px]">
            esc
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-auto p-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center">
              No matches
            </p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
                {group}
              </div>
              {items.map((a) => {
                runningIndex += 1;
                const idx = runningIndex;
                const active = idx === selected;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onMouseEnter={() => setSelected(idx)}
                    onClick={() => a.run()}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm',
                      active && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span className="flex h-7 w-7 items-center justify-center">
                      {a.icon}
                    </span>
                    <span className="flex-1 min-w-0 truncate">{a.label}</span>
                    {a.hint && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {a.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
