import { create } from 'zustand';
import { generateId } from '~/lib/utils';
import type { MediaItem, MediaType } from '~/types/timeline';

interface MediaStore {
  items: MediaItem[];
  addItems: (files: File[]) => Promise<void>;
  removeItem: (id: string) => void;
}

function getMediaType(file: File): MediaType {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'video';
}

async function extractMetadata(file: File, objectUrl: string): Promise<Partial<MediaItem>> {
  const type = getMediaType(file);

  if (type === 'video') {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.src = objectUrl;
      video.onloadedmetadata = () => {
        video.currentTime = 0.01;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        let thumbnailUrl: string | undefined;
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        }
        resolve({
          durationSec: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          thumbnailUrl,
        });
        video.remove();
      };
      video.onerror = () => {
        resolve({ durationSec: 0, width: 1920, height: 1080 });
        video.remove();
      };
    });
  }

  if (type === 'image') {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = objectUrl;
      img.onload = () => {
        resolve({ durationSec: 5, width: img.naturalWidth, height: img.naturalHeight });
        img.remove();
      };
      img.onerror = () => resolve({ durationSec: 5, width: 1920, height: 1080 });
    });
  }

  if (type === 'audio') {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        resolve({ durationSec: audio.duration, width: 0, height: 0 });
        audio.remove();
      };
      audio.onerror = () => resolve({ durationSec: 0, width: 0, height: 0 });
    });
  }

  return { durationSec: 0, width: 0, height: 0 };
}

export const useMediaStore = create<MediaStore>((set) => ({
  items: [],

  addItems: async (files: File[]) => {
    for (const file of files) {
      const objectUrl = URL.createObjectURL(file);
      const type = getMediaType(file);
      const meta = await extractMetadata(file, objectUrl);
      const item: MediaItem = {
        id: generateId(),
        name: file.name,
        type,
        objectUrl,
        durationSec: meta.durationSec ?? 0,
        width: meta.width ?? 1920,
        height: meta.height ?? 1080,
        thumbnailUrl: meta.thumbnailUrl,
      };
      set((s) => ({ items: [...s.items, item] }));
    }
  },

  removeItem: (id: string) => {
    set((s) => {
      const item = s.items.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.objectUrl);
      return { items: s.items.filter((i) => i.id !== id) };
    });
  },
}));
