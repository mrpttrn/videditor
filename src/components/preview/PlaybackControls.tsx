import { useState, useEffect, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore, getDurationSec } from '~/store/useTimelineStore';
import { formatTime } from '~/lib/utils';
import { FPS } from '~/types/timeline';

interface Props {
  playerRef: RefObject<PlayerRef | null>;
}

export function PlaybackControls({ playerRef }: Props) {
  const [playing, setPlaying] = useState(false);
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const clips = useTimelineStore((s) => s.clips);
  const durationSec = getDurationSec(clips);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    return () => {
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [playerRef]);

  function togglePlay() {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-surface)] border-t border-[var(--border)]">
      <button
        onClick={() => playerRef.current?.seekTo(0)}
        title="Go to start"
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <button
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition-colors"
        title={playing ? 'Pause' : 'Play'}
      >
        {playing ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={() => playerRef.current?.seekTo(Math.round(durationSec * FPS))}
        title="Go to end"
        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      <span className="text-xs font-mono text-[var(--text-secondary)] ml-2">
        {formatTime(playheadSec)} / {formatTime(durationSec)}
      </span>
    </div>
  );
}
