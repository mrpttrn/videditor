import { useRef } from 'react';
import type { PlayerRef } from '@remotion/player';
import { TopBar } from './TopBar';
import { PropertiesPanel } from './PropertiesPanel';
import { MediaLibrary } from '~/components/media/MediaLibrary';
import { PreviewPanel } from '~/components/preview/PreviewPanel';
import { TimelinePanel } from '~/components/timeline/TimelinePanel';

export function EditorLayout() {
  const playerRef = useRef<PlayerRef>(null);

  return (
    <div
      className="w-full h-full"
      style={{
        display: 'grid',
        gridTemplateRows: '52px 1fr 260px',
        gridTemplateColumns: '240px 1fr 220px',
        gridTemplateAreas: `
          "topbar topbar topbar"
          "media  preview properties"
          "timeline timeline timeline"
        `,
      }}
    >
      <div style={{ gridArea: 'topbar' }}>
        <TopBar playerRef={playerRef} />
      </div>
      <div style={{ gridArea: 'media' }} className="min-h-0 overflow-hidden border-r border-[var(--border)]">
        <MediaLibrary />
      </div>
      <div style={{ gridArea: 'preview' }} className="min-h-0 overflow-hidden">
        <PreviewPanel playerRef={playerRef} />
      </div>
      <div style={{ gridArea: 'properties' }} className="min-h-0 overflow-hidden">
        <PropertiesPanel />
      </div>
      <div style={{ gridArea: 'timeline' }} className="min-h-0 overflow-hidden">
        <TimelinePanel playerRef={playerRef} />
      </div>
    </div>
  );
}
