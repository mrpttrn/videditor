import { useTimelineStore, getDurationSec } from '~/store/useTimelineStore';
import { formatTimeShort } from '~/lib/utils';
import { PIXELS_PER_SECOND, FPS } from '~/types/timeline';

interface Props {
  playerRef: React.RefObject<import('@remotion/player').PlayerRef | null>;
  scrollLeft: number;
}

export function TimelineRuler({ playerRef, scrollLeft }: Props) {
  const zoom = useTimelineStore((s) => s.zoom);
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const clips = useTimelineStore((s) => s.clips);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  const pxPerSec = PIXELS_PER_SECOND * zoom;
  const durationSec = getDurationSec(clips);
  const totalWidth = Math.max(durationSec * pxPerSec + 200, 800);

  let tickInterval = 1;
  if (pxPerSec < 20) tickInterval = 10;
  else if (pxPerSec < 50) tickInterval = 5;
  else if (pxPerSec < 100) tickInterval = 2;

  const ticks: number[] = [];
  for (let t = 0; t <= durationSec + tickInterval; t += tickInterval) {
    ticks.push(t);
  }

  function seekTo(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const sec = Math.max(0, x / pxPerSec);
    setPlayhead(sec);
    try {
      playerRef.current?.seekTo(Math.round(sec * FPS));
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="relative h-7 bg-[var(--bg-base)] border-b border-[var(--border)] overflow-hidden cursor-col-resize select-none flex-shrink-0"
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); seekTo(e); }}
      onPointerMove={(e) => { if (e.buttons !== 1) return; seekTo(e); }}
    >
      <div className="absolute top-0 left-0 h-full" style={{ width: totalWidth }}>
        {ticks.map((t) => (
          <div key={t} className="absolute top-0 bottom-0 flex flex-col" style={{ left: t * pxPerSec }}>
            <div className="w-px h-2 bg-[var(--text-muted)] mt-auto" />
            <span className="absolute top-1 left-1 text-[9px] text-[var(--text-muted)] whitespace-nowrap">
              {formatTimeShort(t)}
            </span>
          </div>
        ))}

        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: playheadSec * pxPerSec }}
        >
          <div className="w-px h-full bg-red-500" />
          <div
            className="absolute top-0 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #ef4444',
            }}
          />
        </div>
      </div>
    </div>
  );
}
