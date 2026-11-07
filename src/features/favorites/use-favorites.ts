'use client';
import { useCallback, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/shared/lib/store-hooks';
import { setFavorite } from '@/entities/personal/model';
export function useFavorites() {
  const ids = useAppSelector((s) => s.personal.favorites);
  const hydrated = useAppSelector((s) => s.personal.hydrated);
  const dispatch = useAppDispatch();
  const selected = useMemo(() => new Set(ids), [ids]);
  const [notice, setNotice] = useState<{ id: string; name: string; previous: boolean } | null>(
    null,
  );
  const close = useCallback(() => setNotice(null), []);
  function toggle(id: string, name: string) {
    if (!hydrated) return;
    const previous = selected.has(id);
    dispatch(setFavorite({ id, selected: !previous }));
    setNotice({ id, name, previous });
  }
  function undo() {
    if (!notice) return;
    dispatch(setFavorite({ id: notice.id, selected: notice.previous }));
    setNotice(null);
  }
  return { selected, hydrated, toggle, notice, close, undo };
}
