import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { loadDocuments } from '@/lib/storage';

type MentionItem = { id: string; label: string; emoji: string };

type ListProps = {
  items: MentionItem[];
  command: (item: { id: string; label: string }) => void;
};

type ListRef = {
  onKeyDown: (e: { event: KeyboardEvent }) => boolean;
};

const MentionList = forwardRef<ListRef, ListProps>((props, ref) => {
  const { items, command } = props;
  const [selected, setSelected] = useState(0);

  useEffect(() => setSelected(0), [items]);

  const select = (idx: number) => {
    const it = items[idx];
    if (it) command({ id: it.id, label: it.label });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        setSelected((s) => (s + 1) % Math.max(1, items.length));
        return true;
      }
      if (event.key === 'ArrowUp') {
        setSelected((s) => (s - 1 + items.length) % Math.max(1, items.length));
        return true;
      }
      if (event.key === 'Enter') {
        select(selected);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-64 p-2 text-sm text-muted-foreground">
        No matching pages
      </div>
    );
  }

  return (
    <div className="bg-popover text-popover-foreground rounded-md border shadow-md w-64 p-1 max-h-72 overflow-auto">
      {items.map((it, idx) => (
        <button
          key={it.id}
          type="button"
          onMouseEnter={() => setSelected(idx)}
          onClick={() => select(idx)}
          className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
            idx === selected ? 'bg-accent text-accent-foreground' : ''
          }`}
        >
          <span className="text-base">{it.emoji}</span>
          <span className="truncate">{it.label || 'Untitled'}</span>
        </button>
      ))}
    </div>
  );
});
MentionList.displayName = 'MentionList';

export const DocumentMention = Mention.configure({
  HTMLAttributes: {
    class:
      'inline-flex items-center rounded bg-accent px-1 py-0.5 text-accent-foreground font-medium',
  },
  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`;
  },
  suggestion: {
    items: ({ query }) => {
      const docs = loadDocuments();
      const all: MentionItem[] = Object.values(docs).map((d) => ({
        id: d.id,
        label: d.title || 'Untitled',
        emoji: d.emoji,
      }));
      const q = query.toLowerCase();
      return all.filter((it) => it.label.toLowerCase().includes(q)).slice(0, 8);
    },
    render: () => {
      let component: ReactRenderer<ListRef, ListProps> | null = null;
      let popup: TippyInstance[] | null = null;
      return {
        onStart: (props) => {
          component = new ReactRenderer(MentionList, {
            props: {
              items: props.items as MentionItem[],
              command: (it: { id: string; label: string }) => props.command(it),
            },
            editor: props.editor,
          });
          const rect = props.clientRect?.();
          if (!rect) return;
          popup = tippy('body', {
            getReferenceClientRect: () => rect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },
        onUpdate: (props) => {
          component?.updateProps({
            items: props.items as MentionItem[],
            command: (it: { id: string; label: string }) => props.command(it),
          });
          const rect = props.clientRect?.();
          if (rect && popup?.[0]) {
            popup[0].setProps({ getReferenceClientRect: () => rect });
          }
        },
        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }
          return component?.ref?.onKeyDown(props) ?? false;
        },
        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
          popup = null;
          component = null;
        },
      };
    },
  },
});

export default DocumentMention;
