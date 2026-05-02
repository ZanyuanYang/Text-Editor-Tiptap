import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import katex from 'katex';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      setInlineMath: (latex: string) => ReturnType;
    };
    blockMath: {
      setBlockMath: (latex: string) => ReturnType;
    };
  }
}

function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return latex;
  }
}

export const InlineMath = Node.create({
  name: 'inlineMath',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="inline-math"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) ?? '';
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'inline-math',
        'data-latex': latex,
        class: 'tiptap-math-inline',
      }),
      latex,
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('span');
      dom.className = 'tiptap-math-inline';
      dom.setAttribute('data-type', 'inline-math');
      dom.setAttribute('data-latex', node.attrs.latex ?? '');
      dom.innerHTML = renderMath(node.attrs.latex ?? '', false);

      dom.addEventListener('click', () => {
        const next = window.prompt('Edit LaTeX', node.attrs.latex ?? '');
        if (next === null) return;
        const pos = typeof getPos === 'function' ? getPos() : null;
        if (pos === null || pos === undefined) return;
        editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes('inlineMath', { latex: next })
          .run();
      });

      return { dom };
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /(?:^|\s)\$([^$]+)\$$/,
        type: this.type,
        getAttributes: (match) => ({ latex: match[1] }),
      }),
    ];
  },

  addCommands() {
    return {
      setInlineMath:
        (latex: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: 'inlineMath',
            attrs: { latex },
          }),
    };
  },
});

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="block-math"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const latex = (node.attrs.latex as string) ?? '';
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'block-math',
        'data-latex': latex,
        class: 'tiptap-math-block',
      }),
      latex,
    ];
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'tiptap-math-block';
      dom.setAttribute('data-type', 'block-math');
      dom.setAttribute('data-latex', node.attrs.latex ?? '');
      dom.innerHTML = renderMath(node.attrs.latex ?? '', true);

      dom.addEventListener('click', () => {
        const next = window.prompt(
          'Edit LaTeX (block)',
          node.attrs.latex ?? ''
        );
        if (next === null) return;
        const pos = typeof getPos === 'function' ? getPos() : null;
        if (pos === null || pos === undefined) return;
        editor
          .chain()
          .setNodeSelection(pos)
          .updateAttributes('blockMath', { latex: next })
          .run();
      });

      return { dom };
    };
  },

  addCommands() {
    return {
      setBlockMath:
        (latex: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: 'blockMath',
            attrs: { latex },
          }),
    };
  },
});

export default { InlineMath, BlockMath };
