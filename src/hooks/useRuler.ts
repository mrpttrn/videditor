import { useEffect, type RefObject } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '~/store/useTimelineStore';
import { FPS } from '~/types/timeline';

export function useRuler(playerRef: RefObject<PlayerRef | null>) {
  const setPlayhead = useTimelineStore((s) => s.setPlayhead);

  // Only sync player → store. Seeking store → player is done directly
  // via playerRef.current.seekTo() at the call site to avoid a loop.
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
