import React, { createContext, useEffect, useState } from 'react';
import { common, createLowlight } from 'lowlight';
import { useEditor } from '@tiptap/react';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import ListItem from '@tiptap/extension-list-item';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Gapcursor from '@tiptap/extension-gapcursor';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Thread from '@/utils/TiptapExtension/ThreadExtension';

type ThreadType = {
  id: string;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
  date: Date;
  range?: Range;
};

const ThreadsInit: ThreadType[] = [
  {
    id: 'thread-1',
    username: 'User1',
    description: 'This is a description of thread 1',
    expanded: false,
    resolved: true,
    date: new Date(),
  },
  {
    id: 'thread-2',
    username: 'User2',
    description: 'This is a description of thread 2',
    expanded: true,
    resolved: false,
    date: new Date(),
  },
  {
    id: 'thread-3',
    username: 'User3',
    description: 'This is a description of thread 3',
    expanded: false,
    resolved: false,
    date: new Date(),
  },
  {
    id: 'thread-4',
    username: 'User4',
    description: 'This is a description of thread 4',
    expanded: false,
    resolved: false,
    date: new Date(),
  },
  {
    id: 'thread-5',
    username: 'User5',
    description: 'This is a description of thread 5',
    expanded: false,
    resolved: false,
    date: new Date(),
  },
];

type TiptapContextProviderProps = {
  children: React.ReactNode;
};

type TiptapContextType = {
  editor: any;
  content: string;
  setContent: (content: string) => void;
  threads: ThreadType[];
  setThreads: (threads: ThreadType[]) => void;
  editorText: string;
  setEditorText: (editorText: string) => void;
  htmlContent: string;
  setHtmlContent: (htmlContent: string) => void;
};

const TiptapContext = createContext<TiptapContextType>({
  editor: null,
  content: '',
  setContent: () => {},
  threads: [],
  setThreads: () => {},
  editorText: '',
  setEditorText: () => {},
  htmlContent: '',
  setHtmlContent: () => {},
});

function TiptapProvider({ children }: TiptapContextProviderProps) {
  const [content, setContent] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');
  const [threads, setThreads] = useState<ThreadType[]>(ThreadsInit);
  const [htmlContent, setHtmlContent] = useState<string>('');

  const lowlight = createLowlight(common);

  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] } as any),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'my-custom-class',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      Document,
      Paragraph,
      Text,
      Gapcursor,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Thread,
    ],
    editorProps: {
      attributes: {
        class: 'm-2 focus:outline-none',
      },
    },
    content,
  });

  return (
    <TiptapContext.Provider
      value={{
        editor,
        content,
        setContent,
        threads,
        setThreads,
        editorText,
        setEditorText,
        htmlContent,
        setHtmlContent,
      }}
    >
      {children}
    </TiptapContext.Provider>
  );
}

export { TiptapProvider, TiptapContext };
