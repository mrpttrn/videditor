import { AbsoluteFill, Video, Audio, Img, useCurrentFrame } from 'remotion';
import type { Clip, MediaItem } from '~/types/timeline';
import { FPS } from '~/types/timeline';

interface Props {
  clip: Clip;
  mediaItem: MediaItem;
}

export function ClipRenderer({ clip, mediaItem }: Props) {
  const frame = useCurrentFrame();

  if (mediaItem.type === 'video') {
    return (
      <AbsoluteFill>
        <Video
          src={mediaItem.objectUrl}
          startFrom={Math.round(clip.trimStartSec * FPS)}
          endAt={Math.round(clip.trimEndSec * FPS)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          muted={false}
        />
      </AbsoluteFill>
    );
  }

  if (mediaItem.type === 'image') {
    return (
      <AbsoluteFill>
        <Img
          src={mediaItem.objectUrl}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </AbsoluteFill>
    );
  }

  if (mediaItem.type === 'audio') {
    return (
      <Audio
        src={mediaItem.objectUrl}
        startFrom={Math.round(clip.trimStartSec * FPS)}
        endAt={Math.round(clip.trimEndSec * FPS)}
      />
    );
  }

  if (mediaItem.type === 'text') {
    const style = clip.textStyle;
    const opacity = Math.min(1, frame / 5);
    return (
      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity,
        }}
      >
        <div
          style={{
            fontSize: style?.fontSize ?? 48,
            color: style?.color ?? '#ffffff',
            fontFamily: style?.fontFamily ?? 'sans-serif',
            fontWeight: style?.fontWeight ?? 'bold',
            textAlign: style?.textAlign ?? 'center',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            padding: '0 48px',
            wordBreak: 'break-word',
          }}
        >
          {clip.text ?? ''}
        </div>
      </AbsoluteFill>
    );
  }

  return null;
}
