import { Mark, mergeAttributes } from '@tiptap/core';

const Thread = Mark.create({
  name: 'thread',

  // Default attributes for your mark
  defaultOptions: {
    HTMLAttributes: {},
  },

  // Define how attributes are parsed from HTML
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            id: attributes.id,
          };
        },
      },
    };
  },

  // Define how the mark is rendered to HTML
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

  // Define how this mark interacts with the editor commands
  addCommands(): any {
    return {
      setThread:
        (attributes: any) =>
        ({ commands }: any) => {
          return commands.setMark('thread', attributes);
        },
      // unsetThread:
      //   () =>
      //   ({ commands }: any) => {
      //     return commands.unsetMark('thread');
      //   },
      unsetThreadById:
        (id: string) =>
        ({ tr, state, dispatch }: any) => {
          const { doc, selection } = state;
          const { from, to } = selection;
          let updated = false;

          doc.descendants(
            (
              node: {
                marks: { type: { name: string }; attrs: { id: string } }[];
                nodeSize: any;
              },
              pos: any
            ) => {
              if (!node.marks) return;

              node.marks.forEach(
                (mark: { type: { name: string }; attrs: { id: string } }) => {
                  if (mark.type.name === 'thread' && mark.attrs.id === id) {
                    if (dispatch) {
                      tr.removeMark(pos, pos + node.nodeSize, mark.type);
                      updated = true;
                    }
                  }
                }
              );
            }
          );

          if (updated && dispatch) {
            dispatch(tr);
            return true;
          }

          return false;
        },
    };
  },
});

export default Thread;
