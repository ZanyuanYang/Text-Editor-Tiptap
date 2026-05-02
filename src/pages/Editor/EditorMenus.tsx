import type { Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Plus } from 'lucide-react';

import { BubbleMenuBar } from './BubbleMenuBar';
import { BlockMenu } from './BlockMenu';

export function EditorMenus({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <>
      <BlockMenu editor={editor} />
      <BubbleMenuBar editor={editor} />
      <FloatingMenu
        editor={editor}
        shouldShow={({
          state,
        }: {
          state: {
            selection: {
              $from: {
                parent: { type: { name: string }; content: { size: number } };
              };
            };
          };
        }) => {
          const { $from } = state.selection;
          return (
            $from.parent.type.name === 'paragraph' &&
            $from.parent.content.size === 0
          );
        }}
      >
        <button
          type="button"
          className="h-6 w-6 inline-flex items-center justify-center rounded border bg-background text-muted-foreground hover:text-foreground"
          title="Add block"
          onClick={() => editor.chain().focus().insertContent('/').run()}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </FloatingMenu>
    </>
  );
}

export default EditorMenus;
