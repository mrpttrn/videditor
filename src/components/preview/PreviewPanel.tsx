import type { RefObject } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { useTimelineStore } from '~/store/useTimelineStore';
import { useMediaStore } from '~/store/useMediaStore';
import { TimelineComposition } from '~/remotion/TimelineComposition';
import { useRuler } from '~/hooks/useRuler';
import { PlaybackControls } from './PlaybackControls';
import { FPS } from '~/types/timeline';

interface Props {
  playerRef: RefObject<PlayerRef | null>;
}

export function PreviewPanel({ playerRef }: Props) {
  const tracks = useTimelineStore((s) => s.tracks);
  const clips = useTimelineStore((s) => s.clips);
  const durationSecFn = useTimelineStore((s) => s.durationSec);
  const mediaItems = useMediaStore((s) => s.items);

  useRuler(playerRef);

  const durationSec = durationSecFn();

  const firstVideoClip = clips.find((c) => {
    const t = tracks.find((t) => t.id === c.trackId);
    return t?.type === 'video';
  });
  const firstMedia = firstVideoClip
    ? mediaItems.find((m) => m.id === firstVideoClip.mediaId)
    : null;
  const compWidth = firstMedia?.width || 1920;
  const compHeight = firstMedia?.height || 1080;

  const durationInFrames = Math.max(1, Math.round(durationSec * FPS));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      {/* Player area — flex-1 so it fills available height */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111',
          overflow: 'hidden',
        }}
      >
        <Player
          ref={playerRef}
          component={TimelineComposition}
          durationInFrames={durationInFrames}
          fps={FPS}
          compositionWidth={compWidth}
          compositionHeight={compHeight}
          inputProps={{ tracks, clips, mediaItems }}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          clickToPlay={false}
        />
      </div>
      <PlaybackControls playerRef={playerRef} />
    </div>
  );
}
