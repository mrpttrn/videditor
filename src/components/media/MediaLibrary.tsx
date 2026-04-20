import { useMediaStore } from '~/store/useMediaStore';
import { UploadZone } from './UploadZone';
import { MediaCard } from './MediaCard';

export function MediaLibrary() {
  const items = useMediaStore((s) => s.items);
  const removeItem = useMediaStore((s) => s.removeItem);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
      <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Media</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
        <UploadZone />

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
            <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-[var(--text-muted)]">Upload video, image, or audio files</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((item) => (
              <MediaCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
