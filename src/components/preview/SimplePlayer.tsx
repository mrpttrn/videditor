import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  type RefObject,
} from 'react';
import { useTimelineStore, getDurationSec } from '~/store/useTimelineStore';
import { useMediaStore } from '~/store/useMediaStore';
import { FPS } from '~/types/timeline';
import type { Clip, MediaItem } from '~/types/timeline';

export interface SimplePlayerRef {
  seekTo: (frame: number) => void;
  play: () => void;
  pause: () => void;
}

interface Props {
  onTimeUpdate?: (frame: number) => void;
}

function getActiveClip(clips: Clip[], trackId: string, playheadSec: number): Clip | null {
  return (
    clips.find(
      (c) => c.trackId === trackId && playheadSec >= c.startSec && playheadSec < c.startSec + c.durationSec,
    ) ?? null
  );
}

export const SimplePlayer = forwardRef<SimplePlayerRef, Props>(({ onTimeUpdate }, ref) => {
  const tracks = useTimelineStore((s) => s.tracks);
  const clips = useTimelineStore((s) => s.clips);
  const mediaItems = useMediaStore((s) => s.items);
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const durationSec = getDurationSec(clips);
  const mediaMap = new Map<string, MediaItem>(mediaItems.map((m) => [m.id, m]));

  // Find the first video track's active clip
  const videoTracks = tracks.filter((t) => t.type === 'video');
  let activeVideoClip: Clip | null = null;
  let activeVideoMedia: MediaItem | null = null;
  for (const track of videoTracks) {
    const clip = getActiveClip(clips, track.id, playheadSec);
    if (clip) {
      const media = mediaMap.get(clip.mediaId);
      if (media && media.type === 'video') {
        activeVideoClip = clip;
        activeVideoMedia = media;
        break;
      }
    }
  }

  // Expose play/pause/seekTo to parent
  useImperativeHandle(ref, () => ({
    seekTo(frame: number) {
      const sec = frame / FPS;
      setPlayhead(sec);
      if (videoRef.current && activeVideoClip) {
        videoRef.current.currentTime = sec - activeVideoClip.startSec + activeVideoClip.trimStartSec;
      }
    },
    play() {
      videoRef.current?.play();
      setPlaying(true);
      startRaf();
    },
    pause() {
      videoRef.current?.pause();
      setPlaying(false);
      stopRaf();
    },
  }));

  function startRaf() {
    if (rafRef.current != null) return;
    const tick = () => {
      const vid = videoRef.current;
      if (vid && activeVideoClip) {
        const sec = vid.currentTime - activeVideoClip.trimStartSec + activeVideoClip.startSec;
        setPlayhead(sec);
        onTimeUpdate?.(Math.round(sec * FPS));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopRaf() {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // Sync seekTo when playheadSec changes externally (ruler click)
  const lastSeekRef = useRef<number>(-1);
  useEffect(() => {
    if (playing) return; // don't fight with RAF during playback
    if (Math.abs(playheadSec - lastSeekRef.current) < 0.02) return;
    lastSeekRef.current = playheadSec;
    if (videoRef.current && activeVideoClip) {
      videoRef.current.currentTime = playheadSec - activeVideoClip.startSec + activeVideoClip.trimStartSec;
    }
  });

  // Stop RAF on unmount
  useEffect(() => () => stopRaf(), []);

  // Determine background image from active image clips
  const activeImageClips = tracks
    .filter((t) => t.type === 'video')
    .flatMap((t) => {
      const clip = getActiveClip(clips, t.id, playheadSec);
      if (!clip) return [];
      const media = mediaMap.get(clip.mediaId);
      if (!media || media.type !== 'image') return [];
      return [media];
    });

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* Video layer */}
      {activeVideoMedia && (
        <video
          ref={videoRef}
          key={activeVideoMedia.id}
          src={activeVideoMedia.objectUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
          muted={false}
          playsInline
          onEnded={() => {
            setPlaying(false);
            stopRaf();
          }}
        />
      )}

      {/* Image layer */}
      {activeImageClips.map((img) => (
        <img
          key={img.id}
          src={img.objectUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ))}

      {/* Empty state */}
      {!activeVideoMedia && activeImageClips.length === 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5a5a70',
            fontSize: 13,
          }}
        >
          Drop media onto a track to preview
        </div>
      )}

      {/* Timeline marker (current time / total) */}
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
          pointerEvents: 'none',
        }}
      >
        {playheadSec.toFixed(1)}s / {durationSec.toFixed(1)}s
      </div>
    </div>
  );
});

SimplePlayer.displayName = 'SimplePlayer';

// A typed ref that PlaybackControls/TopBar can use
export type SimplePlayerRefObject = RefObject<SimplePlayerRef | null>;
