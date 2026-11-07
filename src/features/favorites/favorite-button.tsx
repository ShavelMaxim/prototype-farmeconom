'use client';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useFavorites } from './use-favorites';
import { ActionButton } from '@/shared/ui/action-button';
import { FeedbackToast } from '@/shared/ui/feedback-toast';
export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const favorites = useFavorites();
  const selected = favorites.selected.has(id);
  return (
    <>
      <ActionButton
        disabled={!favorites.hydrated}
        aria-pressed={selected}
        aria-label={`${selected ? 'Удалить из избранного' : 'В избранное'}: ${name}`}
        onClick={() => favorites.toggle(id, name)}
        icon={selected ? <HeartFilled /> : <HeartOutlined />}
      >
        {selected ? 'В избранном' : 'В избранное'}
      </ActionButton>
      {favorites.notice && (
        <FeedbackToast
          message={selected ? 'Добавлено в избранное' : 'Удалено из избранного'}
          onUndo={favorites.notice.previous ? favorites.undo : undefined}
          onClose={favorites.close}
        />
      )}
    </>
  );
}
