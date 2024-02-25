import React, { useContext, useEffect, useState } from 'react';
import Tiptap from '@/pages/TextEditor/components/Tiptap';
import UploadDoc from '@/pages/TextEditor/components/UploadDoc';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';
import Thread from '@/pages/TextEditor/components/Thread';
import CreateThreadDialog from '@/pages/TextEditor/components/CreateThreadDialog';
import { TiptapContext } from '@/contexts/tiptap_context';
import { GlobalContext } from '@/contexts/global_context';

function TextEditor() {
  const { editor, threads, setThreads } = useContext(TiptapContext);
  const { alertOpen } = useContext(GlobalContext);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    range: Range | undefined;
  }>({
    text: '',
    range: new Range(),
  });

  const createThread = (description: string) => {
    const newThread = {
      id: threads.length + 1,
      username: 'nextjs', // replace with actual username
      description,
      expanded: false,
      resolved: false,
      range: selectionInfo.range,
      date: new Date(),
    };
    (editor as any).commands.setThread({ id: `thread-${threads.length + 1}` });
    setThreads([...threads, newThread]);
  };

  const handleTextSelection = () => {
    const selected = window.getSelection()?.toString();
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
        <UploadDoc />
        <CreateThreadDialog
          selectionInfo={selectionInfo}
          createThread={createThread}
        />
      </div>

      <section className="flex w-full border-black border-4 rounded-2xl">
        <Tiptap />
        <Thread />
      </section>

      {alertOpen && <AlertDestructive />}
    </main>
  );
}

export default TextEditor;
