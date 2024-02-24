import React, { useEffect, useState } from 'react';
import Tiptap from '@/pages/TextEditor/components/Tiptap';
import UploadDoc from '@/pages/TextEditor/components/UploadDoc';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';
import Thread from '@/pages/TextEditor/components/Thread';
import CreateThreadDialog from '@/pages/TextEditor/components/CreateThreadDialog';
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

type ThreadType = {
  id: number;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
  range?: Range;
};

const ThreadsInit: ThreadType[] = [
  {
    id: 1,
    username: 'nextjs',
    description: 'This is a description of thread 1',
    expanded: false,
    resolved: true,
  },
  {
    id: 2,
    username: 'nextjs',
    description: 'This is a description of thread 2',
    expanded: true,
    resolved: false,
  },
  {
    id: 3,
    username: 'nextjs',
    description: 'This is a description of thread 3',
    expanded: false,
    resolved: false,
  },
  {
    id: 4,
    username: 'nextjs',
    description: 'This is a description of thread 4',
    expanded: false,
    resolved: false,
  },
  {
    id: 5,
    username: 'nextjs',
    description: 'This is a description of thread 5',
    expanded: false,
    resolved: false,
  },
];

function TextEditor() {
  const [content, setContent] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [threads, setThreads] = useState<ThreadType[]>(ThreadsInit);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    range: Range | undefined;
  }>({
    text: '',
    range: new Range(),
  });

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
    ],
    editorProps: {
      attributes: {
        class: 'm-2 focus:outline-none',
      },
    },
    content,
  });

  const highlightSelectedText = () => {
    const { range } = selectionInfo;
    if (range) {
      const span = document.createElement('mark');
      span.setAttribute('style', 'background-color: green;'); // For visual confirmation
      const docFrag = range.extractContents();
      const spanId = `span-${threads.length + 1}`;
      span.setAttribute('data', spanId.toString());
      span.appendChild(docFrag);
      range.insertNode(span);
    } else {
      console.log('Range is not valid');
    }
  };

  const createThread = (description: string) => {
    const newThread: ThreadType = {
      id: threads.length + 1,
      username: 'nextjs', // replace with actual username
      description,
      expanded: false,
      resolved: false,
      range: selectionInfo.range,
    };
    setThreads([...threads, newThread]);
    highlightSelectedText();
  };

  const handleTextSelection = () => {
    const selected = window.getSelection()?.toString();
    // setSelectedText(selected);
    if (!selected) {
      return;
    }
    setSelectionInfo({
      text: selected || '',
      range: window.getSelection()?.getRangeAt(0),
    });
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, []);

  return (
    <main className="mt-10 px-8 md:px-40">
      <h1 className="text-3xl font-bold pb-4 text-center">Text Editor</h1>
      <div className="flex justify-between items-center">
        <UploadDoc
          setError={setError}
          setAlertOpen={setAlertOpen}
          setHtmlContent={setHtmlContent}
          setContent={setContent}
        />
        <CreateThreadDialog
          setError={setError}
          setAlertOpen={setAlertOpen}
          selectionInfo={selectionInfo}
          createThread={createThread}
        />
      </div>

      <section className="flex w-full border-black border-4 rounded-2xl">
        <Tiptap
          content={content}
          setContent={setContent}
          editorText={editorText}
        />
        <Thread threads={threads} setThreads={setThreads} />
      </section>

      {alertOpen && <AlertDestructive error={error} />}
    </main>
  );
}

export default TextEditor;
