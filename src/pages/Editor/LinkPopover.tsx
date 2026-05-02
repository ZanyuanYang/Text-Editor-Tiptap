import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import { ExternalLink, Mail, Trash2 } from 'lucide-react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KNOWN_SCHEME_RE = /^(https?:|mailto:|ftp:|ftps:|tel:|sms:)/i;

function normalizeHref(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (KNOWN_SCHEME_RE.test(value)) return value;
  if (EMAIL_RE.test(value)) return `mailto:${value}`;
  if (/^[^\s/]+\.[^\s]+/.test(value)) return `https://${value}`;
  return value;
}

function isMailto(href: string) {
  return href.toLowerCase().startsWith('mailto:');
}

export function LinkPopover({
  editor,
  trigger,
  align = 'start',
}: {
  editor: Editor;
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!open) return;
    const current =
      (editor.getAttributes('link').href as string | undefined) ?? '';
    setUrl(isMailto(current) ? current.slice('mailto:'.length) : current);
  }, [open, editor]);

  const normalized = useMemo(() => normalizeHref(url), [url]);
  const previewLabel = useMemo(() => {
    if (!normalized) return null;
    if (isMailto(normalized)) return normalized.slice('mailto:'.length);
    try {
      const u = new URL(normalized);
      const path = u.pathname === '/' ? '' : u.pathname;
      return `${u.hostname}${path}`;
    } catch {
      return normalized;
    }
  }, [normalized]);
  const previewIsEmail = !!normalized && isMailto(normalized);

  const apply = () => {
    if (!normalized) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: normalized })
        .run();
    }
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().unsetLink().run();
    setOpen(false);
  };

  const openInNewTab = () => {
    if (!normalized) return;
    if (isMailto(normalized)) {
      window.location.href = normalized;
    } else {
      window.open(normalized, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 p-2"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          <Input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                apply();
              }
              if (e.key === 'Escape') setOpen(false);
            }}
            placeholder="Paste URL or email (foo@bar.com)"
            className="h-8 flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={openInNewTab}
            disabled={!normalized}
            aria-label={previewIsEmail ? 'Send email' : 'Open link'}
            title={previewIsEmail ? 'Open mail client' : 'Open in new tab'}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          {editor.isActive('link') && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={remove}
              aria-label="Remove link"
              title="Remove link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        {previewLabel && (
          <div className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-muted-foreground truncate">
            {previewIsEmail ? (
              <Mail className="h-3 w-3 shrink-0" />
            ) : (
              <ExternalLink className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">{previewLabel}</span>
          </div>
        )}
        <div className="mt-2 flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={apply}
            disabled={!normalized && !editor.isActive('link')}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default LinkPopover;
