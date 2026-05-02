import type { JSONContent } from '@tiptap/core';
import type { Document } from './types';

export type DocumentTemplate = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  build: () => Pick<Document, 'title' | 'emoji' | 'content'>;
};

const para = (text = ''): JSONContent => ({
  type: 'paragraph',
  content: text ? [{ type: 'text', text }] : undefined,
});

const heading = (level: 1 | 2 | 3, text: string): JSONContent => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
});

const bullet = (text: string): JSONContent => ({
  type: 'bulletList',
  content: [
    {
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  ],
});

const todo = (text: string, checked = false): JSONContent => ({
  type: 'taskList',
  content: [
    {
      type: 'taskItem',
      attrs: { checked },
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    },
  ],
});

export const TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    emoji: '📝',
    description: 'Empty page',
    build: () => ({
      title: 'Untitled',
      emoji: '📝',
      content: { type: 'doc', content: [para()] },
    }),
  },
  {
    id: 'meeting',
    name: 'Meeting notes',
    emoji: '🗒️',
    description: 'Attendees, agenda, action items',
    build: () => ({
      title: 'Meeting notes',
      emoji: '🗒️',
      content: {
        type: 'doc',
        content: [
          heading(1, 'Meeting notes'),
          para(`Date: ${new Date().toLocaleDateString()}`),
          heading(2, 'Attendees'),
          bullet('Person 1'),
          heading(2, 'Agenda'),
          bullet('Topic 1'),
          heading(2, 'Notes'),
          para(),
          heading(2, 'Action items'),
          todo('Owner — task'),
        ],
      },
    }),
  },
  {
    id: 'blog',
    name: 'Blog post',
    emoji: '✍️',
    description: 'Title, intro, body, conclusion',
    build: () => ({
      title: 'New blog post',
      emoji: '✍️',
      content: {
        type: 'doc',
        content: [
          heading(1, 'Catchy title goes here'),
          para('A one-paragraph hook that makes readers want to keep going.'),
          heading(2, 'Introduction'),
          para(),
          heading(2, 'Main idea'),
          para(),
          heading(2, 'Conclusion'),
          para(),
        ],
      },
    }),
  },
  {
    id: 'journal',
    name: 'Daily journal',
    emoji: '📔',
    description: 'Today, wins, reflections',
    build: () => ({
      title: new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      emoji: '📔',
      content: {
        type: 'doc',
        content: [
          heading(1, '📔 Daily journal'),
          heading(2, 'How I feel'),
          para(),
          heading(2, "Today's wins"),
          bullet('…'),
          heading(2, 'What I learned'),
          para(),
          heading(2, 'Tomorrow'),
          todo('…'),
        ],
      },
    }),
  },
  {
    id: 'project',
    name: 'Project brief',
    emoji: '🚀',
    description: 'Goals, scope, milestones',
    build: () => ({
      title: 'Project brief',
      emoji: '🚀',
      content: {
        type: 'doc',
        content: [
          heading(1, 'Project name'),
          para('One-line description.'),
          heading(2, 'Goals'),
          bullet('Goal 1'),
          heading(2, 'Non-goals'),
          bullet('Out-of-scope item'),
          heading(2, 'Milestones'),
          todo('M1 — …'),
          heading(2, 'Risks'),
          bullet('Risk and mitigation'),
        ],
      },
    }),
  },
  {
    id: 'todo',
    name: 'To-do list',
    emoji: '✅',
    description: 'Quick task list',
    build: () => ({
      title: 'To-do',
      emoji: '✅',
      content: {
        type: 'doc',
        content: [
          heading(1, 'To-do'),
          todo('First task'),
          todo('Second task'),
          todo('Third task'),
        ],
      },
    }),
  },
];
