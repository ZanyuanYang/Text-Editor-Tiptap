import type { Editor } from '@tiptap/react';

import { BubbleMenuBar } from './BubbleMenuBar';
import { BlockMenu } from './BlockMenu';

export function EditorMenus({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <>
      <BlockMenu editor={editor} />
      <BubbleMenuBar editor={editor} />
    </>
  );
}

export default EditorMenus;
