import { useContext, useRef } from 'react';
import type { Editor as TiptapEditor } from '@tiptap/react';
import { Copy, Download, FileDown, FileUp, Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TiptapContext } from '@/contexts/tiptap_context';
import { GlobalContext } from '@/contexts/global_context';
import { jsonToMarkdown, downloadFile } from '@/lib/markdown';
import type { Document } from '@/lib/types';

function ImportItem() {
  const { editor } = useContext(TiptapContext);
  const { setAlertOpen, setError } = useContext(GlobalContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const buf = await file.arrayBuffer();
      const mammoth = (await import('mammoth')).default;
      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      editor.chain().focus().insertContent(result.value).run();
    } catch {
      setError('.docx only — failed to convert');
      setAlertOpen(true);
      setTimeout(() => setAlertOpen(false), 3000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".docx"
        className="hidden"
        onChange={onFile}
      />
      <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
        <FileUp className="mr-2 h-4 w-4" />
        Import .docx
      </DropdownMenuItem>
    </>
  );
}

export function ExportMenu({
  doc,
  editor,
}: {
  doc: Document | null;
  editor: TiptapEditor | null;
}) {
  const exportMd = () => {
    if (!doc) return;
    const md = `# ${doc.title}\n\n${jsonToMarkdown(doc.content)}`;
    downloadFile(`${doc.title || 'untitled'}.md`, md, 'text/markdown');
  };
  const exportHtml = () => {
    if (!doc || !editor) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
      doc.title
    }</title></head><body>${editor.getHTML()}</body></html>`;
    downloadFile(`${doc.title || 'untitled'}.html`, html, 'text/html');
  };
  const copyMd = () => {
    if (!doc) return;
    navigator.clipboard.writeText(jsonToMarkdown(doc.content));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Export">
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export / Import</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print / PDF
          <span className="ml-auto text-[10px] text-muted-foreground">⌘P</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportMd}>
          <FileDown className="mr-2 h-4 w-4" />
          Download .md
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportHtml}>
          <FileDown className="mr-2 h-4 w-4" />
          Download .html
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyMd}>
          <Copy className="mr-2 h-4 w-4" />
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ImportItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportMenu;
