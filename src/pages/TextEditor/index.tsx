import React, { useState } from 'react';
import Tiptap from '@/pages/TextEditor/components/Tiptap';
import UploadDoc from '@/pages/TextEditor/components/UploadDoc';
import AlertDestructive from '@/pages/TextEditor/components/AlertDestructive';

function TextEditor() {
  const [content, setContent] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  return (
    <div className="mt-10 px-8 md:px-40">
      <h1 className="text-3xl font-bold pb-4 text-center">Text Editor</h1>
      <UploadDoc
        setError={setError}
        setAlertOpen={setAlertOpen}
        setHtmlContent={setHtmlContent}
        setContent={setContent}
      />
      <Tiptap
        content={content}
        setContent={setContent}
        editorText={editorText}
      />
      {alertOpen && <AlertDestructive error={error} />}
    </div>
  );
}

export default TextEditor;
