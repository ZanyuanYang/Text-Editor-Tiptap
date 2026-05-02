import type { Document } from '@/lib/types';

export type Heading = { id: string; text: string; level: number };

export function getHeadings(doc: Document): Heading[] {
  const out: Heading[] = [];
  let counter = 0;
  function walk(node: unknown): void {
    if (!node || typeof node !== 'object') return;
    const n = node as {
      type?: string;
      attrs?: { level?: number };
      content?: unknown[];
    };
    if (n.type === 'heading') {
      const text = (n.content ?? [])
        .map((c) => (c as { text?: string }).text ?? '')
        .join('');
      counter += 1;
      out.push({
        id: `h-${counter}`,
        text: text || 'Untitled heading',
        level: n.attrs?.level ?? 1,
      });
    }
    if (n.content) {
      for (const child of n.content) walk(child);
    }
  }
  walk(doc.content);
  return out;
}
