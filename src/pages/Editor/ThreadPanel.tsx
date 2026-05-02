import { useCallback, useContext, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { formatDistanceToNow } from 'date-fns';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useDocuments } from '@/contexts/documents_context';
import { GlobalContext } from '@/contexts/global_context';
import type { ThreadType } from '@/lib/types';
import { cn } from '@/lib/utils';

export function CreateThreadDialog({
  editor,
}: {
  editor: TiptapEditor | null;
}) {
  const { activeId, activeDoc, updateThreads } = useDocuments();
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [pendingRange, setPendingRange] = useState<{
    from: number;
    to: number;
  } | null>(null);

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
      <Button
        variant="outline"
        size="sm"
        className="gap-1 w-full"
        onClick={onOpen}
      >
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

export function ThreadPanel({ editor }: { editor: TiptapEditor | null }) {
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
    setThreads(
      threads.map((x) => ({
        ...x,
        expanded: x.id === id ? !x.expanded : false,
      }))
    );
  };

  const onResolve = (id: string, resolved: boolean) => {
    setThreads(threads.map((x) => (x.id === id ? { ...x, resolved } : x)));
  };

  const onDelete = (id: string) => {
    setThreads(threads.filter((x) => x.id !== id));
    if (editor) {
      editor.commands.unsetThreadById(id);
    }
  };

  const onReply = (id: string, text: string) => {
    if (!text.trim()) return;
    setThreads(
      threads.map((x) =>
        x.id === id
          ? {
              ...x,
              replies: [
                ...(x.replies ?? []),
                {
                  id: `reply-${Date.now()}`,
                  username: 'You',
                  text: text.trim(),
                  date: new Date().toISOString(),
                },
              ],
            }
          : x
      )
    );
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
            onReply={onReply}
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
              onReply={onReply}
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
  onReply,
}: {
  thread: ThreadType;
  onClick: (id: string) => void;
  onResolve: (id: string, r: boolean) => void;
  onDelete: (id: string) => void;
  onReply: (id: string, text: string) => void;
}) {
  const [reply, setReply] = useState('');
  const replies = thread.replies ?? [];
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
      <p className="text-xs mt-1 break-words whitespace-pre-wrap">
        {thread.description}
      </p>

      {(thread.expanded || replies.length > 0) && replies.length > 0 && (
        <div className="mt-2 pl-2 border-l-2 border-border space-y-1.5">
          {replies.map((r) => (
            <div key={r.id} className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{r.username}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(r.date), { addSuffix: true })}
                </span>
              </div>
              <p className="break-words whitespace-pre-wrap">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {thread.expanded && (
        <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply…"
              className="flex-1 h-7 px-2 text-xs rounded-md border bg-background outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && reply.trim()) {
                  onReply(thread.id, reply);
                  setReply('');
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              disabled={!reply.trim()}
              onClick={() => {
                onReply(thread.id, reply);
                setReply('');
              }}
            >
              Send
            </Button>
          </div>
          <div className="flex justify-end gap-1">
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
        </div>
      )}
    </div>
  );
}

export default ThreadPanel;
