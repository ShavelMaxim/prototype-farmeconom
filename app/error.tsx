'use client';
import { Button } from 'antd';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container prose">
      <h1>Не удалось открыть страницу</h1>
      <p>Попробуйте ещё раз. Сохранённая корзина останется на устройстве.</p>
      <Button type="primary" onClick={reset}>
        Повторить
      </Button>
    </main>
  );
}
