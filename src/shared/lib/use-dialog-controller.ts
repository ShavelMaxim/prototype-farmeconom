'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
const OPEN_DIALOG = 'shop:open-dialog';
// Coordinate lazy dialogs without importing AntD into the application shell.
export function useDialogController() {
  const owner = useId();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLElement>(null);
  const setTrigger = useCallback((element: HTMLElement | null) => {
    trigger.current = element;
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }, []);
  useEffect(() => {
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== owner) setOpen(false);
    };
    window.addEventListener(OPEN_DIALOG, onOpen);
    return () => window.removeEventListener(OPEN_DIALOG, onOpen);
  }, [owner]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    // Capture also handles the interval before the lazy dialog mounts/focuses.
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, close]);
  const show = useCallback(() => {
    window.dispatchEvent(new CustomEvent(OPEN_DIALOG, { detail: owner }));
    setOpen(true);
  }, [owner]);
  return { open, show, close, setTrigger };
}
