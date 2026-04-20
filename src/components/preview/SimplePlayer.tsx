import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useMemo,
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

  const mediaMap = useMemo(
    () => new Map<string, MediaItem>(mediaItems.map((m) => [m.id, m])),
    [mediaItems],
  );

  const videoTracks = useMemo(() => tracks.filter((t) => t.type === 'video'), [tracks]);

  const durationSec = getDurationSec(clips);

  const { activeVideoClip, activeVideoMedia } = useMemo(() => {
    for (const track of videoTracks) {
      const clip = getActiveClip(clips, track.id, playheadSec);
      if (clip) {
        const media = mediaMap.get(clip.mediaId);
        if (media && media.type === 'video') {
          return { activeVideoClip: clip, activeVideoMedia: media };
        }
      }
    }
    return { activeVideoClip: null, activeVideoMedia: null };
  }, [clips, videoTracks, playheadSec, mediaMap]);

  // Keep a ref so the RAF tick always sees the latest clip without stale closure
  const activeVideoClipRef = useRef<Clip | null>(null);
  useEffect(() => {
    activeVideoClipRef.current = activeVideoClip;
  }, [activeVideoClip]);

  function startRaf() {
    if (rafRef.current != null) return;
    const tick = () => {
      const vid = videoRef.current;
      const clip = activeVideoClipRef.current;
      if (vid && clip) {
        const sec = vid.currentTime - clip.trimStartSec + clip.startSec;
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

  // Expose play/pause/seekTo to parent
  useImperativeHandle(
    ref,
    () => ({
      seekTo(frame: number) {
        const sec = frame / FPS;
        setPlayhead(sec);
        const clip = activeVideoClipRef.current;
        if (videoRef.current && clip) {
          videoRef.current.currentTime = sec - clip.startSec + clip.trimStartSec;
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Sync video position when playhead changes externally (ruler click, not during playback)
  useEffect(() => {
    if (playing) return;
    if (!activeVideoClip || !videoRef.current) return;
    const targetTime = playheadSec - activeVideoClip.startSec + activeVideoClip.trimStartSec;
    if (Math.abs(videoRef.current.currentTime - targetTime) < 0.02) return;
    videoRef.current.currentTime = targetTime;
  }, [playing, playheadSec, activeVideoClip]);

  // Stop RAF on unmount
  useEffect(() => () => stopRaf(), []);

  // Active image clips at current playhead
  const activeImageClips = useMemo(
    () =>
      videoTracks.flatMap((t) => {
        const clip = getActiveClip(clips, t.id, playheadSec);
        if (!clip) return [];
        const media = mediaMap.get(clip.mediaId);
        if (!media || media.type !== 'image') return [];
        return [media];
      }),
    [videoTracks, clips, playheadSec, mediaMap],
  );

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

      {/* Timeline marker */}
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
