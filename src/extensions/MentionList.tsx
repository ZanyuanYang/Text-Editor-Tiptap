import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

export type MentionItem = { id: string; label: string; emoji: string };

export type MentionListProps = {
  items: MentionItem[];
  command: (item: { id: string; label: string }) => void;
};

export type MentionListRef = {
  onKeyDown: (e: { event: KeyboardEvent }) => boolean;
};

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);

    useEffect(() => setSelected(0), [items]);

    const select = (idx: number) => {
      const it = items[idx];
      if (it) command({ id: it.id, label: it.label });
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowDown') {
          setSelected((s) => (s + 1) % Math.max(1, items.length));
          return true;
        }
        if (event.key === 'ArrowUp') {
          setSelected(
            (s) => (s - 1 + items.length) % Math.max(1, items.length)
          );
          return true;
        }
        if (event.key === 'Enter') {
          select(selected);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-64 p-2 text-sm text-muted-foreground">
          No matching pages
        </div>
      );
    }

    return (
      <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-64 p-1 max-h-72 overflow-auto">
        {items.map((it, idx) => (
          <button
            key={it.id}
            type="button"
            onMouseEnter={() => setSelected(idx)}
            onClick={() => select(idx)}
            className={cn(
              'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
              idx === selected && 'bg-accent text-accent-foreground'
            )}
          >
            <span className="text-base">{it.emoji}</span>
            <span className="truncate">{it.label || 'Untitled'}</span>
          </button>
        ))}
      </div>
    );
  }
);
MentionList.displayName = 'MentionList';

export default MentionList;
