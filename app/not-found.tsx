import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="container prose">
      <p className="eyebrow">404</p>
      <h1>Этой страницы нет</h1>
      <p>Возможно, ссылка изменилась. Все товары доступны в каталоге.</p>
      <Link prefetch={false} href="/" className="back-link">
        Вернуться в каталог →
      </Link>
    </main>
  );
}
