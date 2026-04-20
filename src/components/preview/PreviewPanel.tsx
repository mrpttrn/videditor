import type { RefObject } from 'react';
import { SimplePlayer, type SimplePlayerRef } from './SimplePlayer';
import { PlaybackControls } from './PlaybackControls';
import { useTimelineStore } from '~/store/useTimelineStore';
import { FPS } from '~/types/timeline';

interface Props {
  playerRef: RefObject<SimplePlayerRef | null>;
}

export function PreviewPanel({ playerRef }: Props) {
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f' }}>
      <div id="preview-panel" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <SimplePlayer
          ref={playerRef}
          onTimeUpdate={(frame) => setPlayhead(frame / FPS)}
        />
      </div>
      <PlaybackControls playerRef={playerRef} />
    </div>
  );
}
