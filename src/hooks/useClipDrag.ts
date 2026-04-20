import { useRef } from 'react';
import { useTimelineStore } from '~/store/useTimelineStore';
import { clamp } from '~/lib/utils';
import { PIXELS_PER_SECOND, SNAP_THRESHOLD_PX, MIN_CLIP_WIDTH_PX } from '~/types/timeline';
import type { Clip } from '~/types/timeline';

type DragMode = 'move' | 'trim-left' | 'trim-right';

export function useClipDrag(clip: Clip) {
  const updateClip = useTimelineStore((s) => s.updateClip);
  const clips = useTimelineStore((s) => s.clips);
  const zoom = useTimelineStore((s) => s.zoom);
  const pxPerSec = PIXELS_PER_SECOND * zoom;

  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    originalStartSec: number;
    originalDurationSec: number;
    originalTrimStartSec: number;
    originalTrimEndSec: number;
  } | null>(null);

  function getSnapTargets(): number[] {
    return clips
      .filter((c) => c.id !== clip.id)
      .flatMap((c) => [c.startSec, c.startSec + c.durationSec]);
  }

  function snap(sec: number, targets: number[]): number {
    const threshold = SNAP_THRESHOLD_PX / pxPerSec;
    for (const t of targets) {
      if (Math.abs(sec - t) < threshold) return t;
    }
    return sec;
  }

  function onPointerDown(e: React.PointerEvent, mode: DragMode) {
    e.stopPropagation();
    e.preventDefault();

    dragRef.current = {
      mode,
      startX: e.clientX,
      originalStartSec: clip.startSec,
      originalDurationSec: clip.durationSec,
      originalTrimStartSec: clip.trimStartSec,
      originalTrimEndSec: clip.trimEndSec,
    };

    const targets = getSnapTargets();

    function onMove(ev: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      const deltaX = ev.clientX - d.startX;
      const deltaSec = deltaX / pxPerSec;

      if (d.mode === 'move') {
        const newStart = snap(clamp(d.originalStartSec + deltaSec, 0, Infinity), targets);
        updateClip(clip.id, { startSec: newStart });
      } else if (d.mode === 'trim-left') {
        const maxDelta = d.originalDurationSec - MIN_CLIP_WIDTH_PX / pxPerSec;
        const delta = clamp(deltaSec, -d.originalTrimStartSec, maxDelta);
        updateClip(clip.id, {
          startSec: d.originalStartSec + delta,
          durationSec: d.originalDurationSec - delta,
          trimStartSec: d.originalTrimStartSec + delta,
        });
      } else if (d.mode === 'trim-right') {
        const minDuration = MIN_CLIP_WIDTH_PX / pxPerSec;
        const maxAdd = d.originalTrimEndSec - d.originalTrimStartSec - d.originalDurationSec;
        const newDuration = clamp(d.originalDurationSec + deltaSec, minDuration, d.originalDurationSec + maxAdd);
        updateClip(clip.id, {
          durationSec: newDuration,
          trimEndSec: d.originalTrimStartSec + newDuration,
        });
      }
    }

    function onUp() {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  return { onPointerDown };
}
