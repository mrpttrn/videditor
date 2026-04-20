import { useRef, useEffect } from 'react';
import { useTimelineStore, getDurationSec } from '~/store/useTimelineStore';
import { TrackRow } from './TrackRow';
import { PIXELS_PER_SECOND } from '~/types/timeline';

interface Props {
  scrollLeft: number;
  onScroll: (x: number) => void;
}

export function TimelineTracks({ scrollLeft, onScroll }: Props) {
  const tracks = useTimelineStore((s) => s.tracks);
  const clips = useTimelineStore((s) => s.clips);
  const zoom = useTimelineStore((s) => s.zoom);

  const scrollRef = useRef<HTMLDivElement>(null);

  const pxPerSec = PIXELS_PER_SECOND * zoom;
  const totalWidth = Math.max(getDurationSec(clips) * pxPerSec + 200, 800);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft !== scrollLeft) el.scrollLeft = scrollLeft;
  }, [scrollLeft]);

  function handleScroll() {
    const el = scrollRef.current;
    if (el) onScroll(el.scrollLeft);
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-x-auto overflow-y-auto"
      onScroll={handleScroll}
    >
      {tracks.length === 0 ? (
        <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
          Add a track to get started
        </div>
      ) : (
        <div className="min-w-max">
          {tracks.map((track) => (
            <TrackRow key={track.id} track={track} totalWidth={totalWidth} />
          ))}
        </div>
      )}
    </div>
  );
}
