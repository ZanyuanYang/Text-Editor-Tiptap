import { useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Match = { from: number; to: number };

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatches(
  editor: Editor,
  query: string,
  caseSensitive: boolean
): Match[] {
  if (!query) return [];
  const matches: Match[] = [];
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escapeRegex(query), flags);
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const text = node.text;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const from = pos + m.index;
      const to = from + m[0].length;
      matches.push({ from, to });
      if (m.index === regex.lastIndex) regex.lastIndex += 1;
    }
  });
  return matches;
}

export function FindReplace({
  editor,
  open,
  onClose,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const queryRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(
    () => (editor && query ? findMatches(editor, query, caseSensitive) : []),
    [editor, query, caseSensitive]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => queryRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, caseSensitive]);

  useEffect(() => {
    if (!editor || matches.length === 0) return;
    const m = matches[Math.min(activeIdx, matches.length - 1)];
    if (!m) return;
    editor.commands.setTextSelection(m);
    editor.commands.scrollIntoView();
  }, [editor, matches, activeIdx]);

  if (!open) return null;

  const next = () => {
    if (matches.length === 0) return;
    setActiveIdx((i) => (i + 1) % matches.length);
  };
  const prev = () => {
    if (matches.length === 0) return;
    setActiveIdx((i) => (i - 1 + matches.length) % matches.length);
  };
  const replaceOne = () => {
    if (!editor || matches.length === 0) return;
    const m = matches[Math.min(activeIdx, matches.length - 1)];
    if (!m) return;
    editor.chain().focus().setTextSelection(m).insertContent(replacement).run();
  };
  const replaceAll = () => {
    if (!editor || matches.length === 0) return;
    const chain = editor.chain().focus();
    for (let i = matches.length - 1; i >= 0; i--) {
      chain.setTextSelection(matches[i]).insertContent(replacement);
    }
    chain.run();
  };

  return (
    <div className="fixed top-2 right-4 z-30 w-96 rounded-md border bg-popover text-popover-foreground shadow-lg">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b">
        <Input
          ref={queryRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (e.shiftKey) prev();
              else next();
            }
            if (e.key === 'Escape') onClose();
          }}
          placeholder="Find"
          className="h-7 flex-1"
        />
        <span className="text-[11px] text-muted-foreground tabular-nums w-14 text-center">
          {matches.length === 0
            ? '0/0'
            : `${Math.min(activeIdx + 1, matches.length)}/${matches.length}`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={prev}
          aria-label="Previous"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={next}
          aria-label="Next"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
        <button
          type="button"
          onClick={() => setCaseSensitive((v) => !v)}
          title="Match case (Aa)"
          className={cn(
            'h-7 w-7 inline-flex items-center justify-center rounded text-xs font-mono',
            caseSensitive ? 'bg-accent' : 'hover:bg-accent'
          )}
        >
          Aa
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="px-2 py-1.5">
        <button
          type="button"
          className="text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => setShowReplace((v) => !v)}
        >
          {showReplace ? 'Hide' : 'Show'} replace
        </button>
      </div>

      {showReplace && (
        <div className="flex items-center gap-1 px-2 pb-2">
          <Input
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replace with"
            className="h-7 flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') replaceOne();
              if (e.key === 'Escape') onClose();
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={replaceOne}
          >
            Replace
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={replaceAll}>
            All
          </Button>
        </div>
      )}
    </div>
  );
}

export default FindReplace;
