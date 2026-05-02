import { useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';

import { useDocuments } from '@/contexts/documents_context';
import { cn } from '@/lib/utils';
import { Outline } from './Outline';
import { CreateThreadDialog, ThreadPanel } from './ThreadPanel';

export function RightPanel({ editor }: { editor: TiptapEditor | null }) {
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

export default RightPanel;
