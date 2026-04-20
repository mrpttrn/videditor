import { useState } from 'react';
import { useMediaUpload } from '~/hooks/useMediaUpload';
import { cn } from '~/lib/utils';

export function UploadZone() {
  const { inputRef, openPicker, handleFiles } = useMediaUpload();
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer select-none',
        dragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-hover)]',
      )}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,image/*,audio/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />
      <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
      <span className="text-xs text-[var(--text-secondary)]">
        {dragging ? 'Drop files here' : 'Click or drop media'}
      </span>
    </div>
  );
}
