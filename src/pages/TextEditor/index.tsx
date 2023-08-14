import React, { useState } from 'react';
import Tiptap from '@/pages/TextEditor/components/Tiptap';

function TextEditor() {
  const [content, setContent] = useState<string>('');
  const [editorText, setEditorText] = useState<string>('');

  return (
    <div className="mt-10 px-8 md:px-40">
      <h1 className="text-3xl font-bold pb-4 text-center">Text Editor</h1>
      <Tiptap
        content={content}
        setContent={setContent}
        editorText={editorText}
      />
    </div>
  );
}

export default TextEditor;
