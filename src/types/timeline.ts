export type MediaType = 'video' | 'image' | 'audio' | 'text';

export interface TextStyle {
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  textAlign: 'left' | 'center' | 'right';
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  objectUrl: string;
  durationSec: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

export interface Clip {
  id: string;
  mediaId: string;
  trackId: string;
  startSec: number;
  durationSec: number;
  trimStartSec: number;
  trimEndSec: number;
  text?: string;
  textStyle?: TextStyle;
}

export interface Track {
  id: string;
  label: string;
  type: 'video' | 'audio';
  muted: boolean;
  locked: boolean;
}

export interface CompositionProps {
  tracks: Track[];
  clips: Clip[];
  mediaItems: MediaItem[];
}

export const FPS = 30;
export const PIXELS_PER_SECOND = 100;
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const TRACK_HEIGHT_PX = 64;
export const MIN_CLIP_WIDTH_PX = 20;
export const SNAP_THRESHOLD_PX = 8;
