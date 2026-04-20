import { useEffect, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '~/store/useTimelineStore';
import { FPS } from '~/types/timeline';

export function useRuler(playerRef: RefObject<PlayerRef | null>) {
  const playheadSec = useTimelineStore((s) => s.playheadSec);
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  // Sync playhead changes from store → player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const targetFrame = Math.round(playheadSec * FPS);
    try {
      player.seekTo(targetFrame);
    } catch {
      // player may not be ready
    }
  }, [playheadSec, playerRef]);

  // Sync player frame changes → store
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onTimeUpdate = ({ detail }: { detail: { frame: number } }) => {
      setPlayhead(detail.frame / FPS);
    };

    player.addEventListener('timeupdate', onTimeUpdate);
    return () => player.removeEventListener('timeupdate', onTimeUpdate);
  }, [playerRef, setPlayhead]);
}
