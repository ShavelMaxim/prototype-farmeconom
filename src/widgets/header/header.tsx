'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  ShoppingOutlined,
  HeartOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { LoadingNotice } from '@/shared/ui/loading-notice';
import { useDialogController } from '@/shared/lib/use-dialog-controller';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './header.module.css';
import { SeasonalToggle } from './seasonal-toggle';
const DisplayDialog = dynamic(() => import('@/features/accessibility/display-dialog'), {
  loading: () => <LoadingNotice>Открываем настройки отображения…</LoadingNotice>,
});
export function Header() {
  const count = useAppSelector((s) => s.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  const hydrated = useAppSelector((s) => s.personal.hydrated);
  const {
    open: displayOpen,
    show: showDisplay,
    close: closeDisplay,
    setTrigger: setDisplayTrigger,
  } = useDialogController();
  const bottomNav = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = bottomNav.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      document.documentElement.style.setProperty(
        '--bottom-nav-height',
        `${element.getBoundingClientRect().height}px`,
      );
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const pathname = usePathname();
  const links = [
    { href: '/', label: 'Каталог', icon: <AppstoreOutlined /> },
    { href: '/favorites', label: 'Избранное', icon: <HeartOutlined /> },
    { href: '/cart', label: 'Корзина', icon: <ShoppingOutlined /> },
    { href: '/orders', label: 'Заказы', icon: <UnorderedListOutlined /> },
  ];
  const current = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  return (
    <>
      <div className={styles.notice}>
        <span>Ангарск · с заботой о вас и ваших близких</span>
        <Link prefetch={false} href="/about">
          Как заказать
        </Link>
      </div>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link
            prefetch={false}
            href="/"
            className={styles.logo}
            aria-label="Фарм Эконом — каталог"
          >
            <span className={styles.cross} aria-hidden="true">
              +
            </span>
            <span>
              <span className={styles.word}>фарм эконом</span>
              <small className={styles.tagline}>ЗАБОТА КАЖДЫЙ ДЕНЬ</small>
            </span>
          </Link>
          <div className={styles.location}>
            <span className={styles.city}>Самовывоз · Ангарск</span>
            <PharmacyPicker />
          </div>
          <nav aria-label="Основная навигация" className={styles.nav}>
            <Link prefetch={false} href="/">
              <AppstoreOutlined aria-hidden="true" /> Каталог
            </Link>
            <Link
              prefetch={false}
              href="/favorites"
              aria-current={current('/favorites') ? 'page' : undefined}
            >
              <HeartOutlined aria-hidden="true" /> Избранное
            </Link>
            <Link
              prefetch={false}
              href="/orders"
              aria-current={current('/orders') ? 'page' : undefined}
            >
              <UnorderedListOutlined aria-hidden="true" /> Мои заказы
            </Link>
          </nav>
          <SeasonalToggle />
          <button
            className={styles.display}
            ref={setDisplayTrigger}
            disabled={!hydrated}
            aria-label="Настройки отображения"
            aria-haspopup="dialog"
            aria-expanded={displayOpen}
            onClick={showDisplay}
          >
            <EyeOutlined />
            <span>Вид</span>
          </button>
          <Link
            prefetch={false}
            href="/cart"
            className={styles.cart}
            aria-label={`Корзина, товаров: ${count}`}
          >
            <span className={styles.cartIcon}>
              <ShoppingOutlined style={{ fontSize: 22 }} />
              {count > 0 && (
                <span className={styles.count} aria-hidden="true">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
            <span>Корзина</span>
          </Link>
        </div>
      </header>
      <nav ref={bottomNav} className={styles.bottomNav} aria-label="Мобильная навигация">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            prefetch={false}
            href={href}
            aria-current={current(href) ? 'page' : undefined}
            aria-label={href === '/cart' ? `Корзина, товаров: ${count}` : label}
          >
            <span className={styles.bottomIcon}>
              {icon}
              {href === '/cart' && count > 0 && (
                <small aria-hidden="true">{count > 99 ? '99+' : count}</small>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {displayOpen && <DisplayDialog onClose={closeDisplay} />}
    </>
  );
}
