import { AbsoluteFill, Sequence } from 'remotion';
import { ClipRenderer } from './ClipRenderer';
import type { CompositionProps } from '~/types/timeline';
import { FPS } from '~/types/timeline';

export function TimelineComposition({ tracks, clips, mediaItems }: CompositionProps) {
  const mediaMap = new Map(mediaItems.map((m) => [m.id, m]));

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {tracks.map((track) => {
        const trackClips = clips
          .filter((c) => c.trackId === track.id)
          .sort((a, b) => a.startSec - b.startSec);

        return trackClips.map((clip) => {
          const mediaItem = mediaMap.get(clip.mediaId);
          if (!mediaItem) return null;

          const from = Math.round(clip.startSec * FPS);
          const durationInFrames = Math.max(1, Math.round(clip.durationSec * FPS));

          return (
            <Sequence key={clip.id} from={from} durationInFrames={durationInFrames} layout="none">
              <ClipRenderer clip={clip} mediaItem={mediaItem} />
            </Sequence>
          );
        });
      })}
    </AbsoluteFill>
  );
}
