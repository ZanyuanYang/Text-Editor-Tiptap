import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuid } from 'uuid';
import {
  loadActiveDocId,
  loadDocuments,
  saveActiveDocId,
  saveDocuments,
} from '@/lib/storage';
import type { Document, ThreadType } from '@/lib/types';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

type SaveState = 'idle' | 'saving' | 'saved';

type DocumentsContextType = {
  documents: Record<string, Document>;
  orderedIds: string[];
  activeId: string | null;
  activeDoc: Document | null;
  saveState: SaveState;
  lastSavedAt: Date | null;
  createDocument: (init?: Partial<Document>) => string;
  duplicateDocument: (id: string) => string | null;
  deleteDocument: (id: string) => void;
  renameDocument: (id: string, title: string) => void;
  setEmoji: (id: string, emoji: string) => void;
  setCover: (id: string, coverUrl: string | null) => void;
  toggleStar: (id: string) => void;
  setActive: (id: string) => void;
  updateContent: (id: string, content: Document['content']) => void;
  updateThreads: (id: string, threads: ThreadType[]) => void;
  reorder: (ids: string[]) => void;
  flush: () => void;
};

const DocumentsContext = createContext<DocumentsContextType | null>(null);

const EMPTY_CONTENT = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

function makeDocument(partial: Partial<Document> = {}): Document {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? uuid(),
    title: partial.title ?? 'Untitled',
    emoji: partial.emoji ?? '📝',
    content: partial.content ?? EMPTY_CONTENT,
    threads: partial.threads ?? [],
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    order: partial.order ?? Date.now(),
  };
}

function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Record<string, Document>>(() => {
    const stored = loadDocuments();
    if (Object.keys(stored).length === 0) {
      const seed = makeDocument({
        title: 'Welcome',
        emoji: '👋',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Welcome to Tiptap Editor' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Press / on a new line for the slash menu, or just start typing.',
                },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Pages auto-save to your browser. Create new pages from the sidebar.',
                },
              ],
            },
          ],
        },
      });
      return { [seed.id]: seed };
    }
    return stored;
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    const stored = loadActiveDocId();
    const docs = loadDocuments();
    if (stored && docs[stored]) return stored;
    const ids = Object.keys(docs);
    return ids[0] ?? null;
  });

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const docsRef = useRef(documents);
  useEffect(() => {
    docsRef.current = documents;
  }, [documents]);

  // First-render seeding write so the welcome doc lives in storage too.
  useEffect(() => {
    saveDocuments(documents);
    if (activeId && !loadActiveDocId()) {
      saveActiveDocId(activeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistNow = useCallback((next: Record<string, Document>) => {
    setSaveState('saving');
    saveDocuments(next);
    setLastSavedAt(new Date());
    setSaveState('saved');
  }, []);

  const debouncedPersist = useDebouncedCallback<[Record<string, Document>]>(
    (next) => persistNow(next),
    800
  );

  const writeDocs = useCallback(
    (updater: (prev: Record<string, Document>) => Record<string, Document>) => {
      setDocuments((prev) => {
        const next = updater(prev);
        debouncedPersist.call(next);
        return next;
      });
    },
    [debouncedPersist]
  );

  const createDocument = useCallback(
    (init?: Partial<Document>): string => {
      const doc = makeDocument(init);
      writeDocs((prev) => ({ ...prev, [doc.id]: doc }));
      setActiveId(doc.id);
      saveActiveDocId(doc.id);
      return doc.id;
    },
    [writeDocs]
  );

  const duplicateDocument = useCallback(
    (id: string): string | null => {
      const src = docsRef.current[id];
      if (!src) return null;
      const copy = makeDocument({
        title: `${src.title} (copy)`,
        emoji: src.emoji,
        content: JSON.parse(JSON.stringify(src.content)),
        threads: src.threads.map((t) => ({ ...t, id: uuid() })),
      });
      writeDocs((prev) => ({ ...prev, [copy.id]: copy }));
      setActiveId(copy.id);
      saveActiveDocId(copy.id);
      return copy.id;
    },
    [writeDocs]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      writeDocs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActiveId((prev) => {
        if (prev !== id) return prev;
        const remaining = Object.values(docsRef.current).filter(
          (d) => d.id !== id
        );
        const fallback = remaining[0]?.id ?? null;
        if (fallback) saveActiveDocId(fallback);
        return fallback;
      });
    },
    [writeDocs]
  );

  const renameDocument = useCallback(
    (id: string, title: string) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], title, updatedAt: new Date().toISOString() },
        };
      });
    },
    [writeDocs]
  );

  const setEmoji = useCallback(
    (id: string, emoji: string) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], emoji, updatedAt: new Date().toISOString() },
        };
      });
    },
    [writeDocs]
  );

  const setCover = useCallback(
    (id: string, coverUrl: string | null) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev[id], updatedAt: new Date().toISOString() };
        if (coverUrl) next.coverUrl = coverUrl;
        else delete next.coverUrl;
        return { ...prev, [id]: next };
      });
    },
    [writeDocs]
  );

  const toggleStar = useCallback(
    (id: string) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: {
            ...prev[id],
            starred: !prev[id].starred,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [writeDocs]
  );

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    saveActiveDocId(id);
  }, []);

  const updateContent = useCallback(
    (id: string, content: Document['content']) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], content, updatedAt: new Date().toISOString() },
        };
      });
    },
    [writeDocs]
  );

  const updateThreads = useCallback(
    (id: string, threads: ThreadType[]) => {
      writeDocs((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], threads, updatedAt: new Date().toISOString() },
        };
      });
    },
    [writeDocs]
  );

  const reorder = useCallback(
    (ids: string[]) => {
      writeDocs((prev) => {
        const next = { ...prev };
        ids.forEach((id, idx) => {
          if (next[id]) next[id] = { ...next[id], order: idx };
        });
        return next;
      });
    },
    [writeDocs]
  );

  const flush = useCallback(() => {
    debouncedPersist.flush();
  }, [debouncedPersist]);

  // Flush on visibility hide / unload.
  useEffect(() => {
    const onUnload = () => debouncedPersist.flush();
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') debouncedPersist.flush();
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [debouncedPersist]);

  const orderedIds = useMemo(
    () =>
      Object.values(documents)
        .sort((a, b) => a.order - b.order)
        .map((d) => d.id),
    [documents]
  );

  const activeDoc = activeId ? (documents[activeId] ?? null) : null;

  const value = useMemo<DocumentsContextType>(
    () => ({
      documents,
      orderedIds,
      activeId,
      activeDoc,
      saveState,
      lastSavedAt,
      createDocument,
      duplicateDocument,
      deleteDocument,
      renameDocument,
      setEmoji,
      setCover,
      toggleStar,
      setActive,
      updateContent,
      updateThreads,
      reorder,
      flush,
    }),
    [
      documents,
      orderedIds,
      activeId,
      activeDoc,
      saveState,
      lastSavedAt,
      createDocument,
      duplicateDocument,
      deleteDocument,
      renameDocument,
      setEmoji,
      setCover,
      toggleStar,
      setActive,
      updateContent,
      updateThreads,
      reorder,
      flush,
    ]
  );

  return (
    <DocumentsContext.Provider value={value}>
      {children}
    </DocumentsContext.Provider>
  );
}

function useDocuments(): DocumentsContextType {
  const ctx = React.useContext(DocumentsContext);
  if (!ctx)
    throw new Error('useDocuments must be used within DocumentsProvider');
  return ctx;
}

export { DocumentsProvider, DocumentsContext, useDocuments };
