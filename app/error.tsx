'use client';
import { ActionButton } from '@/shared/ui/action-button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container prose">
      <h1>Не удалось открыть страницу</h1>
      <p>Попробуйте ещё раз. Сохранённая корзина останется на устройстве.</p>
      <ActionButton variant="primary" onClick={reset}>
        Повторить
      </ActionButton>
    </main>
  );
}
