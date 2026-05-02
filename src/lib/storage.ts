import type { Document, Theme } from './types';

const KEY_DOCUMENTS = 'tiptap-editor:documents:v1';
const KEY_ACTIVE = 'tiptap-editor:active-doc:v1';
const KEY_THEME = 'tiptap-editor:theme:v1';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] failed to write ${key}`, err);
  }
}

export function loadDocuments(): Record<string, Document> {
  if (typeof window === 'undefined') return {};
  return safeParse<Record<string, Document>>(
    localStorage.getItem(KEY_DOCUMENTS),
    {}
  );
}

export function saveDocuments(docs: Record<string, Document>): void {
  if (typeof window === 'undefined') return;
  safeWrite(KEY_DOCUMENTS, docs);
}

export function loadActiveDocId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY_ACTIVE);
}

export function saveActiveDocId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_ACTIVE, id);
}

export function loadTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const v = localStorage.getItem(KEY_THEME);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

export function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_THEME, theme);
}

export function approximateStorageBytes(): number {
  if (typeof window === 'undefined') return 0;
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const v = localStorage.getItem(k) ?? '';
    total += k.length + v.length;
  }
  return total * 2;
}
