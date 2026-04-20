import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '~/lib/utils';
import type { MediaItem } from '~/types/timeline';

interface Props {
  item: MediaItem;
  onRemove: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  audio: '🎵',
  text: 'T',
};

export function MediaCard({ item, onRemove }: Props) {
  const [open, setOpen] = useState(false);

  const thumbnail = item.thumbnailUrl ?? (item.type === 'image' ? item.objectUrl : null);

  return (
    <>
      <div
        className={cn(
          'group relative rounded overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] cursor-grab hover:border-indigo-500 transition-colors',
        )}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('mediaId', item.id);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        onDoubleClick={() => setOpen(true)}
        title={item.name}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.name}
            className="w-full aspect-video object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center text-2xl bg-[var(--bg-hover)] text-[var(--text-muted)]">
            {TYPE_ICONS[item.type] ?? '🎬'}
          </div>
        )}

        <div className="px-1.5 py-1">
          <p className="text-[10px] text-[var(--text-secondary)] truncate">{item.name}</p>
        </div>

        <button
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded p-0.5 text-white hover:bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          title="Remove"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-full p-4 bg-[var(--bg-elevated)] rounded-xl shadow-xl">
            <Dialog.Title className="text-sm font-medium mb-3 text-[var(--text-primary)]">{item.name}</Dialog.Title>
            {item.type === 'video' && (
              <video src={item.objectUrl} controls className="w-full rounded" />
            )}
            {item.type === 'image' && (
              <img src={item.objectUrl} alt={item.name} className="w-full rounded object-contain max-h-[60vh]" />
            )}
            {item.type === 'audio' && (
              <audio src={item.objectUrl} controls className="w-full" />
            )}
            <Dialog.Close className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
