import type { JSONContent } from '@tiptap/core';

export type ThreadType = {
  id: string;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
  date: string; // ISO 8601
  // ProseMirror positions; persisted (DOM Range cannot be serialized).
  range?: { from: number; to: number };
};

export type Document = {
  id: string;
  title: string;
  emoji: string;
  content: JSONContent;
  threads: ThreadType[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  order: number;
};

export type Theme = 'light' | 'dark' | 'system';
