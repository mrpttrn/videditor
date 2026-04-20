import { useTimelineStore } from '~/store/useTimelineStore';
import { useMediaStore } from '~/store/useMediaStore';
import { formatTime } from '~/lib/utils';

export function PropertiesPanel() {
  const selectedId = useTimelineStore((s) => s.selectedClipId);
  const clips = useTimelineStore((s) => s.clips);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const removeClip = useTimelineStore((s) => s.removeClip);
  const splitClip = useTimelineStore((s) => s.splitClip);
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const mediaItems = useMediaStore((s) => s.items);

  const clip = clips.find((c) => c.id === selectedId);
  const media = clip ? mediaItems.find((m) => m.id === clip.mediaId) : null;

  if (!clip) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-surface)] border-l border-[var(--border)]">
        <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-[var(--text-muted)] text-center px-4">Select a clip to view properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-l border-[var(--border)] overflow-y-auto">
      <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Properties</span>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div>
          <p className="text-[10px] text-[var(--text-muted)] mb-0.5">File</p>
          <p className="text-xs text-[var(--text-primary)] truncate">{media?.name ?? 'Unknown'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Start</p>
            <p className="text-xs text-[var(--text-primary)]">{formatTime(clip.startSec)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Duration</p>
            <p className="text-xs text-[var(--text-primary)]">{formatTime(clip.durationSec)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Trim in</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max={clip.trimEndSec}
              value={clip.trimStartSec.toFixed(2)}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), clip.trimEndSec - 0.1);
                const delta = v - clip.trimStartSec;
                updateClip(clip.id, {
                  trimStartSec: v,
                  startSec: clip.startSec + delta,
                  durationSec: clip.durationSec - delta,
                });
              }}
              className="w-full text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Trim out</label>
            <input
              type="number"
              step="0.1"
              min={clip.trimStartSec}
              value={clip.trimEndSec.toFixed(2)}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), clip.trimStartSec + 0.1);
                updateClip(clip.id, {
                  trimEndSec: v,
                  durationSec: v - clip.trimStartSec,
                });
              }}
              className="w-full text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)]"
            />
          </div>
        </div>

        {clip.text !== undefined && (
          <div>
            <label className="text-[10px] text-[var(--text-muted)] block mb-0.5">Text</label>
            <textarea
              value={clip.text}
              onChange={(e) => updateClip(clip.id, { text: e.target.value })}
              rows={3}
              className="w-full text-xs bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-2 py-1 text-[var(--text-primary)] resize-none"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 pt-1 border-t border-[var(--border-subtle)]">
          <button
            className="text-xs px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors"
            onClick={() => splitClip(clip.id, playheadSec)}
          >
            Split at playhead
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
            onClick={() => removeClip(clip.id)}
          >
            Delete clip
          </button>
        </div>
      </div>
    </div>
  );
}
