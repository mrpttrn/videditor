import { useRef } from 'react';
import { useMediaStore } from '~/store/useMediaStore';

export function useMediaUpload() {
  const addItems = useMediaStore((s) => s.addItems);
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFiles(files: FileList | File[] | null) {
    if (!files) return;
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith('video/') || f.type.startsWith('image/') || f.type.startsWith('audio/'),
    );
    if (arr.length > 0) await addItems(arr);
  }

  return { inputRef, openPicker, handleFiles };
}
