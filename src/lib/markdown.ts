import type { JSONContent } from '@tiptap/core';

type MarkType = string;

function applyMarks(text: string, marks?: { type: MarkType; attrs?: Record<string, unknown> }[]): string {
  if (!marks?.length) return text;
  let out = text;
  for (const m of marks) {
    switch (m.type) {
      case 'bold':
        out = `**${out}**`;
        break;
      case 'italic':
        out = `*${out}*`;
        break;
      case 'strike':
        out = `~~${out}~~`;
        break;
      case 'code':
        out = `\`${out}\``;
        break;
      case 'underline':
        out = `<u>${out}</u>`;
        break;
      case 'link': {
        const href = (m.attrs?.href as string) || '';
        out = `[${out}](${href})`;
        break;
      }
      default:
        break;
    }
  }
  return out;
}

function escapeText(text: string): string {
  return text.replace(/([\\`*_{}\[\]()#+\-!>])/g, '\\$1');
}

function nodeToMd(node: JSONContent, depth = 0, listIndex = 0): string {
  if (!node) return '';

  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map((n) => nodeToMd(n)).join('\n\n').trim();

    case 'paragraph':
      return (node.content ?? []).map((n) => nodeToMd(n)).join('');

    case 'text': {
      const txt = (node.text ?? '');
      return applyMarks(escapeText(txt), node.marks as never);
    }

    case 'heading': {
      const level = Math.min(6, Math.max(1, (node.attrs?.level as number) ?? 1));
      const inner = (node.content ?? []).map((n) => nodeToMd(n)).join('');
      return `${'#'.repeat(level)} ${inner}`;
    }

    case 'bulletList': {
      return (node.content ?? [])
        .map((n) => nodeToMd(n, depth + 1))
        .join('\n');
    }

    case 'orderedList': {
      return (node.content ?? [])
        .map((n, i) => nodeToMd(n, depth + 1, i + 1))
        .join('\n');
    }

    case 'listItem': {
      const indent = '  '.repeat(Math.max(0, depth - 1));
      const bullet = listIndex > 0 ? `${listIndex}.` : '-';
      const inner = (node.content ?? [])
        .map((n) => nodeToMd(n, depth))
        .join('\n')
        .trim();
      return `${indent}${bullet} ${inner}`;
    }

    case 'taskList': {
      return (node.content ?? []).map((n) => nodeToMd(n, depth + 1)).join('\n');
    }

    case 'taskItem': {
      const checked = node.attrs?.checked ? 'x' : ' ';
      const indent = '  '.repeat(Math.max(0, depth - 1));
      const inner = (node.content ?? [])
        .map((n) => nodeToMd(n, depth))
        .join('\n')
        .trim();
      return `${indent}- [${checked}] ${inner}`;
    }

    case 'blockquote': {
      const inner = (node.content ?? []).map((n) => nodeToMd(n)).join('\n');
      return inner
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n');
    }

    case 'codeBlock': {
      const lang = (node.attrs?.language as string) || '';
      const inner = (node.content ?? []).map((n) => (n.text ?? '')).join('');
      return `\`\`\`${lang}\n${inner}\n\`\`\``;
    }

    case 'horizontalRule':
      return '---';

    case 'hardBreak':
      return '  \n';

    case 'image': {
      const alt = (node.attrs?.alt as string) ?? '';
      const src = (node.attrs?.src as string) ?? '';
      return `![${alt}](${src})`;
    }

    case 'youtube': {
      const src = (node.attrs?.src as string) ?? '';
      return `[YouTube](${src})`;
    }

    case 'table': {
      const rows = (node.content ?? []) as JSONContent[];
      if (rows.length === 0) return '';
      const renderRow = (row: JSONContent) =>
        '| ' +
        (row.content ?? [])
          .map((cell) => (cell.content ?? []).map((n) => nodeToMd(n)).join(' ').trim())
          .join(' | ') +
        ' |';
      const header = renderRow(rows[0]);
      const cols = (rows[0].content ?? []).length;
      const sep = '|' + ' --- |'.repeat(cols);
      const body = rows.slice(1).map(renderRow).join('\n');
      return [header, sep, body].filter(Boolean).join('\n');
    }

    default: {
      if (node.content) {
        return node.content.map((n) => nodeToMd(n)).join('');
      }
      return '';
    }
  }
}

export function jsonToMarkdown(doc: JSONContent): string {
  return nodeToMd(doc).trim() + '\n';
}

export function downloadFile(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
