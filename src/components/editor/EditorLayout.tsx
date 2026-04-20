import { useRef } from 'react';
import { TopBar } from './TopBar';
import { PropertiesPanel } from './PropertiesPanel';
import { MediaLibrary } from '~/components/media/MediaLibrary';
import { PreviewPanel } from '~/components/preview/PreviewPanel';
import { TimelinePanel } from '~/components/timeline/TimelinePanel';
import type { SimplePlayerRef } from '~/components/preview/SimplePlayer';

export function EditorLayout() {
  const playerRef = useRef<SimplePlayerRef>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, height: 52 }}>
        <TopBar playerRef={playerRef} />
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, width: 240, overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          <MediaLibrary />
        </div>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <PreviewPanel playerRef={playerRef} />
        </div>
        <div style={{ flexShrink: 0, width: 220, overflow: 'hidden' }}>
          <PropertiesPanel />
        </div>
      </div>

      <div style={{ flexShrink: 0, height: 260, overflow: 'hidden' }}>
        <TimelinePanel playerRef={playerRef} />
      </div>
    </div>
  );
}
