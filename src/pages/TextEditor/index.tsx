import React, { useState } from 'react';
import Tiptap from '@/pages/TextEditor/components/Tiptap';
import UploadDoc from '@/pages/TextEditor/components/UploadDoc';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';
import Thread from '@/pages/TextEditor/components/Thread';

type ThreadType = {
  id: number;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
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

  return (
    <div className="mt-10 px-8 md:px-40">
      <h1 className="text-3xl font-bold pb-4 text-center">Text Editor</h1>
      <UploadDoc
        setError={setError}
        setAlertOpen={setAlertOpen}
        setHtmlContent={setHtmlContent}
        setContent={setContent}
      />
      <section className="flex w-full border-black border-4 rounded-2xl">
        <Tiptap
          content={content}
          setContent={setContent}
          editorText={editorText}
        />
        <Thread threads={threads} setThreads={setThreads} />
      </section>

      {alertOpen && <AlertDestructive error={error} />}
    </div>
  );
}

export default TextEditor;
