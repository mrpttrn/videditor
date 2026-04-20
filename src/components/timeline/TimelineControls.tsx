import { useTimelineStore } from '~/store/useTimelineStore';
import { MIN_ZOOM, MAX_ZOOM } from '~/types/timeline';

export function TimelineControls() {
  const addTrack = useTimelineStore((s) => s.addTrack);
  const zoom = useTimelineStore((s) => s.zoom);
  const setZoom = useTimelineStore((s) => s.setZoom);
  const undo = useTimelineStore((s) => s.undo);
  const redo = useTimelineStore((s) => s.redo);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border)] flex-shrink-0">
      <button
        className="text-[11px] px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => addTrack('video')}
      >
        + Video
      </button>
      <button
        className="text-[11px] px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => addTrack('audio')}
      >
        + Audio
      </button>

      <div className="h-4 w-px bg-[var(--border)] mx-1" />

      <button
        className="text-[11px] px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        onClick={undo}
        title="Undo (Ctrl+Z)"
      >
        ↩
      </button>
      <button
        className="text-[11px] px-2 py-1 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        onClick={redo}
        title="Redo (Ctrl+Y)"
      >
        ↪
      </button>

      <div className="flex-1" />

      <span className="text-[10px] text-[var(--text-muted)]">Zoom</span>
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.05}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        className="w-24 h-1"
      />
      <span className="text-[10px] text-[var(--text-muted)] w-8 text-right">{zoom.toFixed(1)}x</span>
    </div>
  );
}
