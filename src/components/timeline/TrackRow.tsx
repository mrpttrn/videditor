import { useTimelineStore } from '~/store/useTimelineStore';
import { useMediaStore } from '~/store/useMediaStore';
import { cn } from '~/lib/utils';
import { Clip } from './Clip';
import type { Track } from '~/types/timeline';
import { PIXELS_PER_SECOND, TRACK_HEIGHT_PX } from '~/types/timeline';

interface Props {
  track: Track;
  totalWidth: number;
}

export function TrackRow({ track, totalWidth }: Props) {
  const clips = useTimelineStore((s) => s.clips.filter((c) => c.trackId === track.id));
  const addClip = useTimelineStore((s) => s.addClip);
  const removeTrack = useTimelineStore((s) => s.removeTrack);
  const toggleMute = useTimelineStore((s) => s.toggleMute);
  const setSelected = useTimelineStore((s) => s.setSelectedClip);
  const zoom = useTimelineStore((s) => s.zoom);
  const mediaItems = useMediaStore((s) => s.items);
  const pxPerSec = PIXELS_PER_SECOND * zoom;

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const mediaId = e.dataTransfer.getData('mediaId');
    if (!mediaId) return;
    const media = mediaItems.find((m) => m.id === mediaId);
    if (!media) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const startSec = Math.max(0, x / pxPerSec);
    const durationSec = media.durationSec > 0 ? media.durationSec : 5;

    addClip({
      mediaId,
      trackId: track.id,
      startSec,
      durationSec,
      trimStartSec: 0,
      trimEndSec: durationSec,
    });
  }

  return (
    <div className="flex border-b border-[var(--border-subtle)]" style={{ height: TRACK_HEIGHT_PX }}>
      {/* Track label */}
      <div className="flex-shrink-0 w-28 flex items-center gap-1.5 px-2 bg-[var(--bg-surface)] border-r border-[var(--border)]">
        <span className="text-[10px] text-[var(--text-secondary)] truncate flex-1">{track.label}</span>
        <button
          className={cn(
            'p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors',
            track.muted && 'text-amber-400',
          )}
          onClick={() => toggleMute(track.id)}
          title={track.muted ? 'Unmute' : 'Mute'}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            {track.muted ? (
              <path d="M16.5 12A4.5 4.5 0 0012 7.5v2.09l4.26 4.26c.14-.3.24-.61.24-.85zM19 9.15L17.85 8 12 13.85 6.15 8 5 9.15l2.5 2.5V18h3v-2.37l4.5 4.5L17 18v-3.25l2 2L19 9.15zM4.27 3L3 4.27 7.73 9H7v6H5V9H3v6h2v3h14l-1.5-1.5L4.27 3z" />
            ) : (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            )}
          </svg>
        </button>
        <button
          className="p-0.5 rounded text-[var(--text-muted)] hover:text-red-400 transition-colors"
          onClick={() => removeTrack(track.id)}
          title="Remove track"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Clip area */}
      <div
        className="relative flex-1 bg-[var(--bg-elevated)] overflow-hidden"
        style={{ minWidth: totalWidth }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => setSelected(null)}
      >
        {clips.map((clip) => (
          <Clip key={clip.id} clip={clip} />
        ))}
      </div>
    </div>
  );
}
