import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

import { loadDocuments } from '@/lib/storage';
import {
  MentionList,
  type MentionItem,
  type MentionListProps,
  type MentionListRef,
} from './MentionList';

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
      const q = query.toLowerCase();
      const all: MentionItem[] = Object.values(docs).map((d) => ({
        id: d.id,
        label: d.title || 'Untitled',
        emoji: d.emoji,
      }));
      return all.filter((it) => it.label.toLowerCase().includes(q)).slice(0, 8);
    },
    render: () => {
      let component: ReactRenderer<MentionListRef, MentionListProps> | null =
        null;
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
