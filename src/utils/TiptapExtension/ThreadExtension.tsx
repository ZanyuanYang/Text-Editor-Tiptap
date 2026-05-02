import { Mark, mergeAttributes, type RawCommands } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    thread: {
      setThread: (attributes: { id: string }) => ReturnType;
      unsetThreadById: (id: string) => ReturnType;
    };
  }
}

const Thread = Mark.create({
  name: 'thread',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { id: attributes.id };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class:
          'bg-indigo-200 hover:bg-indigo-300 transition duration-300 cursor-pointer underline underline-offset-2',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setThread:
        (attributes) =>
        ({ commands }) =>
          commands.setMark('thread', attributes),

      unsetThreadById:
        (id) =>
        ({ tr, state, dispatch }) => {
          let updated = false;

          state.doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === 'thread' && mark.attrs.id === id) {
                if (dispatch) {
                  tr.removeMark(pos, pos + node.nodeSize, mark.type);
                  updated = true;
                }
              }
            });
          });

          if (updated && dispatch) {
            dispatch(tr);
            return true;
          }

          return false;
        },
    } satisfies Partial<RawCommands>;
  },
});

export default Thread;
