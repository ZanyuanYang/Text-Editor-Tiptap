import { useMemo } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';

import type { Document } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getHeadings } from './getHeadings';

export function Outline({
  editor,
  doc,
}: {
  editor: TiptapEditor | null;
  doc: Document | null;
}) {
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
    return (
      <p className="text-xs text-muted-foreground p-3">
        No headings in this page.
      </p>
    );
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

export default Outline;
