import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const GROUPS: { title: string; items: { keys: string; label: string }[] }[] = [
  {
    title: 'General',
    items: [
      { keys: '⌘ K', label: 'Open command palette' },
      { keys: '⌘ F', label: 'Find in page' },
      { keys: '⌘ ⇧ H', label: 'Find & replace' },
      { keys: '⌘ /', label: 'Show this dialog' },
      { keys: '⌘ P', label: 'Print / Export as PDF' },
      { keys: '⌘ Z', label: 'Undo' },
      { keys: '⌘ ⇧ Z', label: 'Redo' },
    ],
  },
  {
    title: 'Formatting',
    items: [
      { keys: '⌘ B', label: 'Bold' },
      { keys: '⌘ I', label: 'Italic' },
      { keys: '⌘ U', label: 'Underline' },
      { keys: '⌘ E', label: 'Inline code' },
      { keys: '⌘ ⇧ X', label: 'Strikethrough' },
      { keys: '⌘ K', label: 'Add link (when text selected)' },
    ],
  },
  {
    title: 'Blocks (markdown shortcuts)',
    items: [
      { keys: '#  ', label: 'Heading 1' },
      { keys: '##  ', label: 'Heading 2' },
      { keys: '###  ', label: 'Heading 3' },
      { keys: '>  ', label: 'Quote' },
      { keys: '-  ', label: 'Bullet list' },
      { keys: '1.  ', label: 'Numbered list' },
      { keys: '[ ]  ', label: 'To-do list' },
      { keys: '```', label: 'Code block' },
      { keys: '---', label: 'Divider' },
      { keys: '$x$', label: 'Inline math' },
    ],
  },
  {
    title: 'Editor',
    items: [
      { keys: '/', label: 'Slash command menu' },
      { keys: '@', label: 'Mention another page' },
      { keys: 'Tab / ⇧ Tab', label: 'Indent / outdent list item' },
      { keys: 'Enter', label: 'New block / next list item' },
    ],
  },
];

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 max-h-[60vh] overflow-auto">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {g.title}
              </h3>
              <ul className="space-y-1">
                {g.items.map((it) => (
                  <li
                    key={it.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">{it.label}</span>
                    <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono whitespace-nowrap">
                      {it.keys}
                    </kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground border-t pt-2">
          On Windows / Linux replace ⌘ with Ctrl.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default ShortcutsDialog;
