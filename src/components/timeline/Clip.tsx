import { useTimelineStore } from '~/store/useTimelineStore';
import { useMediaStore } from '~/store/useMediaStore';
import { useClipDrag } from '~/hooks/useClipDrag';
import { cn } from '~/lib/utils';
import type { Clip as ClipType } from '~/types/timeline';
import { PIXELS_PER_SECOND, TRACK_HEIGHT_PX } from '~/types/timeline';

interface Props {
  clip: ClipType;
}

const TYPE_COLORS: Record<string, string> = {
  video: 'bg-blue-700 border-blue-500',
  image: 'bg-emerald-700 border-emerald-500',
  audio: 'bg-amber-700 border-amber-500',
  text: 'bg-violet-700 border-violet-500',
};

export function Clip({ clip }: Props) {
  const zoom = useTimelineStore((s) => s.zoom);
  const selectedId = useTimelineStore((s) => s.selectedClipId);
  const setSelected = useTimelineStore((s) => s.setSelectedClip);
  const removeClip = useTimelineStore((s) => s.removeClip);
  const mediaItem = useMediaStore((s) => s.items.find((m) => m.id === clip.mediaId));

  const { onPointerDown } = useClipDrag(clip);
  const pxPerSec = PIXELS_PER_SECOND * zoom;
  const left = clip.startSec * pxPerSec;
  const width = Math.max(clip.durationSec * pxPerSec, 20);
  const isSelected = selectedId === clip.id;

  const mediaType = mediaItem?.type ?? 'video';
  const colorClass = TYPE_COLORS[mediaType] ?? TYPE_COLORS.video;
  const thumbnail = mediaItem?.thumbnailUrl ?? (mediaItem?.type === 'image' ? mediaItem.objectUrl : null);

  return (
    <div
      className={cn(
        'absolute top-1 rounded border overflow-hidden select-none',
        colorClass,
        isSelected && 'ring-2 ring-white',
      )}
      style={{
        left,
        width,
        height: TRACK_HEIGHT_PX - 8,
        cursor: 'grab',
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(clip.id);
      }}
      onPointerDown={(e) => onPointerDown(e, 'move')}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') removeClip(clip.id);
      }}
      tabIndex={0}
    >
      {/* Thumbnail background */}
      {thumbnail && mediaType === 'video' && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
          }}
        />
      )}

      {/* Left trim handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-10 bg-white/20 hover:bg-white/40 transition-colors"
        onPointerDown={(e) => onPointerDown(e, 'trim-left')}
      />

      {/* Label */}
      <div className="relative px-3 py-1 h-full flex items-center overflow-hidden pointer-events-none">
        <span className="text-[10px] text-white/90 truncate font-medium">
          {mediaItem?.name ?? clip.text ?? 'Clip'}
        </span>
      </div>

      {/* Right trim handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-10 bg-white/20 hover:bg-white/40 transition-colors"
        onPointerDown={(e) => onPointerDown(e, 'trim-right')}
      />
    </div>
  );
}
