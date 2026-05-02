import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { common, createLowlight } from 'lowlight';
import { useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Gapcursor from '@tiptap/extension-gapcursor';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Youtube from '@tiptap/extension-youtube';
import FontFamily from '@tiptap/extension-font-family';
import Thread from '@/utils/TiptapExtension/ThreadExtension';
import SlashCommand from '@/extensions/SlashCommand';
import { InlineMath, BlockMath } from '@/extensions/Math';
import DocumentMention from '@/extensions/Mention';
import { useDocuments } from '@/contexts/documents_context';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { ThreadType } from '@/lib/types';

type TiptapContextType = {
  editor: Editor | null;
  threads: ThreadType[];
  setThreads: (threads: ThreadType[]) => void;
};

const TiptapContext = createContext<TiptapContextType>({
  editor: null,
  threads: [],
  setThreads: () => {},
});

const lowlight = createLowlight(common);

function TiptapProvider({ children }: { children: React.ReactNode }) {
  const { activeId, activeDoc, updateContent, updateThreads } = useDocuments();
  const lastSyncedIdRef = useRef<string | null>(null);

  const debouncedContent = useDebouncedCallback<
    [string, ReturnType<Editor['getJSON']>]
  >((id, content) => updateContent(id, content), 300);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        horizontalRule: false,
      }),
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({} as never),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Underline,
      CodeBlockLowlight.configure({ lowlight }),
      Highlight.configure({ multicolor: true }),
      Gapcursor,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:opacity-80',
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading';
          return "Press '/' for commands…";
        },
        showOnlyCurrent: true,
      }),
      CharacterCount.configure(),
      Typography,
      Subscript,
      Superscript,
      HorizontalRule,
      Youtube.configure({ controls: true, nocookie: true }),
      FontFamily,
      InlineMath,
      BlockMath,
      DocumentMention,
      Thread,
      SlashCommand,
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral dark:prose-invert max-w-none focus:outline-none px-12 py-8 min-h-[60vh]',
      },
    },
    content: activeDoc?.content ?? {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    onUpdate: ({ editor: ed }) => {
      if (!activeId) return;
      debouncedContent.call(activeId, ed.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || !activeDoc) return;
    if (lastSyncedIdRef.current === activeDoc.id) return;
    lastSyncedIdRef.current = activeDoc.id;
    debouncedContent.flush();
    editor.commands.setContent(activeDoc.content, { emitUpdate: false });
  }, [editor, activeDoc, debouncedContent]);

  const setThreads = useMemo(
    () => (next: ThreadType[]) => {
      if (!activeId) return;
      updateThreads(activeId, next);
    },
    [activeId, updateThreads]
  );

  const value = useMemo<TiptapContextType>(
    () => ({
      editor,
      threads: activeDoc?.threads ?? [],
      setThreads,
    }),
    [editor, activeDoc, setThreads]
  );

  return (
    <TiptapContext.Provider value={value}>{children}</TiptapContext.Provider>
  );
}

function useTiptap(): TiptapContextType {
  return useContext(TiptapContext);
}

export { TiptapProvider, TiptapContext, useTiptap };
