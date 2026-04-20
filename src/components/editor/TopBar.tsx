import { useState } from 'react';
import type { PlayerRef } from '@remotion/player';
import { useTimelineStore } from '~/store/useTimelineStore';
import { FPS } from '~/types/timeline';
import { cn } from '~/lib/utils';

interface Props {
  playerRef: React.RefObject<PlayerRef | null>;
}

export function TopBar({ playerRef }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const durationSecFn = useTimelineStore((s) => s.durationSec);

  async function handleExport() {
    const player = playerRef.current;
    if (!player || exporting) return;

    const durationSec = durationSecFn();

    // Find canvas inside player container
    const container = (player as unknown as { getContainerNode?: () => HTMLElement | null }).getContainerNode?.();
    const canvas = container?.querySelector('canvas');

    if (!canvas) {
      alert('Preview not ready. Play the timeline first, then export.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = (canvas as HTMLCanvasElement & { captureStream(fps: number): MediaStream }).captureStream(FPS);
    } catch {
      alert('Export not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setExporting(true);
    setProgress(0);

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const done = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    recorder.start(100);
    player.seekTo(0);
    player.play();

    const interval = setInterval(() => {
      const p = useTimelineStore.getState().playheadSec / durationSec;
      setProgress(Math.min(p, 0.99));
    }, 200);

    // Wait until playhead reaches end
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        const ph = useTimelineStore.getState().playheadSec;
        if (ph >= durationSec - 0.2) {
          clearInterval(check);
          resolve();
        }
      }, 200);
    });

    player.pause();
    recorder.stop();
    clearInterval(interval);
    await done;

    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.webm';
    a.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    setProgress(0);
  }

  return (
    <div className="flex items-center gap-3 px-4 h-full bg-[var(--bg-surface)] border-b border-[var(--border)]">
      <div className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">VidEditor</span>
      </div>

      <div className="flex-1" />

      <button
        className={cn(
          'flex items-center gap-2 text-xs px-4 py-1.5 rounded font-medium transition-colors',
          exporting
            ? 'bg-[var(--bg-elevated)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white',
        )}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            {Math.round(progress * 100)}%
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </>
        )}
      </button>
    </div>
  );
}
