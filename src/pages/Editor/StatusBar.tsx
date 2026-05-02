import { useEffect, useState } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';

export function StatusBar({ editor }: { editor: TiptapEditor | null }) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => force((n) => n + 1);
    editor.on('update', onUpdate);
    editor.on('selectionUpdate', onUpdate);
    return () => {
      editor.off('update', onUpdate);
      editor.off('selectionUpdate', onUpdate);
    };
  }, [editor]);
  if (!editor) return null;
  const cc = editor.storage.characterCount as
    | { words: () => number; characters: () => number }
    | undefined;
  const words = cc?.words?.() ?? 0;
  const chars = cc?.characters?.() ?? 0;
  const readingMins = Math.max(1, Math.ceil(words / 200));

  const { from, to } = editor.state.selection;
  const selectedText =
    from === to ? '' : editor.state.doc.textBetween(from, to, ' ');
  const selectedWords = selectedText.trim()
    ? selectedText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground flex items-center gap-4">
      <span>
        {words} word{words === 1 ? '' : 's'}
      </span>
      <span>
        {chars} char{chars === 1 ? '' : 's'}
      </span>
      <span>~{readingMins} min read</span>
      {selectedWords > 0 && (
        <span className="text-foreground">
          Selected: {selectedWords} word{selectedWords === 1 ? '' : 's'}
        </span>
      )}
      <span className="ml-auto">Tiptap Editor</span>
    </div>
  );
}

export default StatusBar;
