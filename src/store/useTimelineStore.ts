import { create } from 'zustand';
import { generateId, clamp } from '~/lib/utils';
import type { Clip, Track } from '~/types/timeline';
import { MIN_ZOOM, MAX_ZOOM } from '~/types/timeline';

const MAX_HISTORY = 50;

interface HistoryEntry {
  tracks: Track[];
  clips: Clip[];
}

export interface TimelineStore {
  tracks: Track[];
  clips: Clip[];
  zoom: number;
  playheadSec: number;
  selectedClipId: string | null;
  history: HistoryEntry[];
  historyIndex: number;

  addClip: (clip: Omit<Clip, 'id'>) => void;
  updateClip: (id: string, patch: Partial<Clip>) => void;
  removeClip: (id: string) => void;
  splitClip: (id: string, atSec: number) => void;

  addTrack: (type: 'video' | 'audio') => void;
  removeTrack: (id: string) => void;
  toggleMute: (id: string) => void;

  setPlayhead: (sec: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedClip: (id: string | null) => void;

  undo: () => void;
  redo: () => void;
}

function pushHistory(state: TimelineStore): { history: HistoryEntry[]; historyIndex: number } {
  const entry: HistoryEntry = {
    tracks: JSON.parse(JSON.stringify(state.tracks)),
    clips: JSON.parse(JSON.stringify(state.clips)),
  };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

export function getDurationSec(clips: Clip[]): number {
  if (clips.length === 0) return 30;
  return Math.max(...clips.map((c) => c.startSec + c.durationSec), 30);
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  tracks: [
    { id: 'track-1', label: 'Video 1', type: 'video', muted: false, locked: false },
    { id: 'track-2', label: 'Audio 1', type: 'audio', muted: false, locked: false },
  ],
  clips: [],
  zoom: 1,
  playheadSec: 0,
  selectedClipId: null,
  history: [],
  historyIndex: -1,

  addClip: (clipData) => {
    set((s) => {
      const hist = pushHistory(s);
      const clip: Clip = { ...clipData, id: generateId() };
      return { ...hist, clips: [...s.clips, clip] };
    });
  },

  updateClip: (id, patch) => {
    set((s) => ({
      clips: s.clips.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  removeClip: (id) => {
    set((s) => {
      const hist = pushHistory(s);
      return { ...hist, clips: s.clips.filter((c) => c.id !== id), selectedClipId: null };
    });
  },

  splitClip: (id, atSec) => {
    set((s) => {
      const clip = s.clips.find((c) => c.id === id);
      if (!clip) return s;
      if (atSec <= clip.startSec || atSec >= clip.startSec + clip.durationSec) return s;

      const splitOffsetSec = atSec - clip.startSec;
      const leftDuration = splitOffsetSec;
      const rightDuration = clip.durationSec - splitOffsetSec;
      const leftTrimEnd = clip.trimStartSec + leftDuration;

      const left: Clip = { ...clip, durationSec: leftDuration, trimEndSec: leftTrimEnd };
      const right: Clip = {
        ...clip,
        id: generateId(),
        startSec: atSec,
        durationSec: rightDuration,
        trimStartSec: leftTrimEnd,
      };

      const hist = pushHistory(s);
      return { ...hist, clips: s.clips.map((c) => (c.id === id ? left : c)).concat(right) };
    });
  },

  addTrack: (type) => {
    set((s) => {
      const count = s.tracks.filter((t) => t.type === type).length + 1;
      const label = `${type === 'video' ? 'Video' : 'Audio'} ${count}`;
      const track: Track = { id: generateId(), label, type, muted: false, locked: false };
      return { tracks: [...s.tracks, track] };
    });
  },

  removeTrack: (id) => {
    set((s) => ({
      tracks: s.tracks.filter((t) => t.id !== id),
      clips: s.clips.filter((c) => c.trackId !== id),
    }));
  },

  toggleMute: (id) => {
    set((s) => ({
      tracks: s.tracks.map((t) => (t.id === id ? { ...t, muted: !t.muted } : t)),
    }));
  },

  setPlayhead: (sec) => set({ playheadSec: sec }),

  setZoom: (zoom) => set({ zoom: clamp(zoom, MIN_ZOOM, MAX_ZOOM) }),

  setSelectedClip: (id) => set({ selectedClipId: id }),

  undo: () => {
    set((s) => {
      if (s.historyIndex < 0) return s;
      const entry = s.history[s.historyIndex];
      return { tracks: entry.tracks, clips: entry.clips, historyIndex: s.historyIndex - 1 };
    });
  },

  redo: () => {
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const entry = s.history[s.historyIndex + 1];
      return { tracks: entry.tracks, clips: entry.clips, historyIndex: s.historyIndex + 1 };
    });
  },
}));
