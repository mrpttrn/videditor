import { forwardRef, useImperativeHandle, type RefObject } from 'react';
import { useTimelineStore, getDurationSec } from '~/store/useTimelineStore';

export interface SimplePlayerRef {
  seekTo: (frame: number) => void;
  play: () => void;
  pause: () => void;
}

interface Props {
  onTimeUpdate?: (frame: number) => void;
}

export const SimplePlayer = forwardRef<SimplePlayerRef, Props>((_props, ref) => {
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const clips = useTimelineStore((s) => s.clips);
  const durationSec = getDurationSec(clips);

  useImperativeHandle(ref, () => ({
    seekTo: () => {},
    play: () => {},
    pause: () => {},
  }));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{ color: '#5a5a70', fontSize: 13 }}>
        Drop media onto a track to preview
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'monospace',
          background: 'rgba(0,0,0,0.4)',
          padding: '2px 6px',
          borderRadius: 4,
        }}
      >
        {playheadSec.toFixed(1)}s / {durationSec.toFixed(1)}s
      </div>
    </div>
  );
});

SimplePlayer.displayName = 'SimplePlayer';

export type SimplePlayerRefObject = RefObject<SimplePlayerRef | null>;
