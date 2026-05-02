import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Link as LinkIcon, Trash2, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

const GALLERY: { id: string; thumb: string; full: string }[] = [
  {
    id: 'mountain',
    thumb:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'forest',
    thumb:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'ocean',
    thumb:
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'desert',
    thumb:
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'city',
    thumb:
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'aurora',
    thumb:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'pastel',
    thumb:
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&q=80&auto=format&fit=crop',
  },
  {
    id: 'gradient',
    thumb:
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=320&q=70&auto=format&fit=crop',
    full: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&q=80&auto=format&fit=crop',
  },
];

type Tab = 'upload' | 'link' | 'gallery';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

export function CoverImageDialog({
  open,
  onOpenChange,
  initialUrl,
  onSave,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string | null;
  onSave: (url: string) => void;
  onRemove: () => void;
}) {
  const [tab, setTab] = useState<Tab>('upload');
  const [linkUrl, setLinkUrl] = useState(initialUrl ?? '');
  const [pendingUrl, setPendingUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLinkUrl(initialUrl ?? '');
    setPendingUrl(initialUrl);
    setError(null);
    setDragOver(false);
    setBusy(false);
    const startsLink = !!initialUrl && /^https?:\/\//i.test(initialUrl);
    setTab(startsLink ? 'link' : 'upload');
  }, [open, initialUrl]);

  const handleFile = useCallback(async (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, GIF, or WebP).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `Image is too large (${(file.size / 1024 / 1024).toFixed(
          1
        )} MB). Max 8 MB.`
      );
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPendingUrl(dataUrl);
    } catch {
      setError('Could not read that file.');
    } finally {
      setBusy(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const file = Array.from(e.clipboardData.items)
        .find((i) => i.kind === 'file' && i.type.startsWith('image/'))
        ?.getAsFile();
      if (file) {
        e.preventDefault();
        handleFile(file);
      }
    },
    [handleFile]
  );

  const linkPreview = useMemo(() => {
    const trimmed = linkUrl.trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('data:')) {
      return null;
    }
    return trimmed;
  }, [linkUrl]);

  const previewUrl = tab === 'link' ? linkPreview : pendingUrl;

  const canSave = (() => {
    if (tab === 'link') return !!linkPreview;
    return !!pendingUrl;
  })();

  const commit = () => {
    if (tab === 'link') {
      if (!linkPreview) {
        setError('Enter a valid http(s) URL.');
        return;
      }
      onSave(linkPreview);
    } else if (pendingUrl) {
      onSave(pendingUrl);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-3" onPaste={onPaste}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" />
            {initialUrl ? 'Change cover image' : 'Add cover image'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm">
          {(['upload', 'link', 'gallery'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 capitalize transition-colors',
                tab === t
                  ? 'bg-background shadow-sm font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'upload'
                ? 'Upload'
                : t === 'link'
                  ? 'Embed link'
                  : 'Gallery'}
            </button>
          ))}
        </div>

        <div className="min-h-[220px]">
          {tab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
                'hover:border-primary/50 hover:bg-accent/40',
                dragOver
                  ? 'border-primary bg-accent/60'
                  : 'border-border bg-muted/30'
              )}
            >
              <div className="rounded-full bg-background p-3 shadow-sm">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  {busy
                    ? 'Reading image…'
                    : dragOver
                      ? 'Drop to upload'
                      : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WebP &middot; up to 8 MB &middot; or paste from
                  clipboard
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
          )}

          {tab === 'link' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <LinkIcon className="h-3 w-3" />
                  Image URL
                </label>
                <Input
                  autoFocus
                  type="url"
                  placeholder="https://images.unsplash.com/…"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && linkPreview) commit();
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Paste a public image URL. Works with Unsplash, Imgur, your own
                  CDN, etc.
                </p>
              </div>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GALLERY.map((g) => {
                const selected = pendingUrl === g.full;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setPendingUrl(g.full)}
                    className={cn(
                      'aspect-[4/3] overflow-hidden rounded-md border bg-muted relative transition-all',
                      selected
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:opacity-90'
                    )}
                  >
                    <img
                      src={g.thumb}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>
            <div className="relative w-full h-32 overflow-hidden rounded-md border bg-muted">
              <img
                src={previewUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setError('Could not load that image.')}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {initialUrl && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive sm:mr-auto"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Remove
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={commit} disabled={!canSave || busy}>
            {initialUrl ? 'Update cover' : 'Set cover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CoverImageDialog;
