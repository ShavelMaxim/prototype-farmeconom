'use client';
import Link from 'next/link';
import { ShoppingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/shared/lib/store-hooks';
import { PharmacyPicker } from '@/features/pharmacy/picker';
import styles from './header.module.css';
export function Header() {
  const count = useAppSelector((s) => s.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <>
      <div className={styles.notice}>
        <span>Учебный концепт для портфолио · товары, цены и аптеки вымышлены</span>
        <Link prefetch={false} href="/about">
          О проекте <ArrowRightOutlined />
        </Link>
      </div>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link
            prefetch={false}
            href="/"
            className={styles.logo}
            aria-label="Аптека рядом — каталог"
          >
            <span className={styles.cross}>+</span>
            <span>
              аптека
              <span className={styles.word}>
                рядом<span className={styles.dot}>.</span>
              </span>
            </span>
          </Link>
          <div className={styles.location}>
            <span className={styles.city}>АНГАРСК</span>
            <PharmacyPicker />
          </div>
          <nav aria-label="Основная навигация" className={styles.nav}>
            <Link prefetch={false} href="/">
              Каталог
            </Link>
            <Link prefetch={false} href="/about" className={styles.about}>
              О проекте
            </Link>
          </nav>
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
    </>
  );
}
