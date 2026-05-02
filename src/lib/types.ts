import type { JSONContent } from '@tiptap/core';

export type Reply = {
  id: string;
  username: string;
  text: string;
  date: string; // ISO 8601
};

export type ThreadType = {
  id: string;
  username: string;
  description: string;
  expanded: boolean;
  resolved: boolean;
  date: string; // ISO 8601
  // ProseMirror positions; persisted (DOM Range cannot be serialized).
  range?: { from: number; to: number };
  replies?: Reply[];
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
  starred?: boolean;
  coverUrl?: string;
};

export type Theme = 'light' | 'dark' | 'system';
