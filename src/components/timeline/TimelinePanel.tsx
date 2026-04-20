import { useRef, useState } from 'react';
import type { SimplePlayerRef } from '~/components/preview/SimplePlayer';
import { TimelineControls } from './TimelineControls';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTracks } from './TimelineTracks';

interface Props {
  playerRef: React.RefObject<SimplePlayerRef | null>;
}

export function TimelinePanel({ playerRef }: Props) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const rulerScrollRef = useRef<HTMLDivElement>(null);

  function handleTracksScroll(x: number) {
    setScrollLeft(x);
    if (rulerScrollRef.current) rulerScrollRef.current.scrollLeft = x;
  }

  return (
    <div className="flex flex-col h-full border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <TimelineControls />

      <div className="flex flex-shrink-0">
        <div className="w-28 flex-shrink-0 bg-[var(--bg-surface)] border-r border-b border-[var(--border)]" />
        <div ref={rulerScrollRef} className="flex-1 overflow-hidden">
          <TimelineRuler playerRef={playerRef} scrollLeft={scrollLeft} />
        </div>
      </div>

      <TimelineTracks scrollLeft={scrollLeft} onScroll={handleTracksScroll} />
    </div>
  );
}
